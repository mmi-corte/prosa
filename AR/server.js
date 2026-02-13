const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Generate self-signed certificate
const forge = require('node-forge');
const pki = forge.pki;
const os = require('os');

// Function to get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIP = getLocalIP();
console.log('Local IP detected:', localIP);

// Create a new keypair
const keys = pki.rsa.generateKeyPair(2048);

// Create a certificate
const cert = pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [{
  name: 'commonName',
  value: localIP
}, {
  name: 'countryName',
  value: 'FR'
}, {
  shortName: 'ST',
  value: 'Corsica'
}, {
  name: 'localityName',
  value: 'Ajaccio'
}, {
  name: 'organizationName',
  value: 'PROSA'
}, {
  shortName: 'OU',
  value: 'AR'
}];

cert.setSubject(attrs);
cert.setIssuer(attrs);

// Add Subject Alternative Names (SAN) for localhost and local IP
cert.setExtensions([{
  name: 'subjectAltName',
  altNames: [
    { type: 2, value: 'localhost' },
    { type: 7, ip: '127.0.0.1' },
    { type: 7, ip: localIP }
  ]
}, {
  name: 'basicConstraints',
  cA: true
}]);

cert.sign(keys.privateKey);

// Convert to PEM format
const pemCert = pki.certificateToPem(cert);
const pemKey = pki.privateKeyToPem(keys.privateKey);

// HTTPS server options
const options = {
  key: pemKey,
  cert: pemCert
};

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.mind': 'application/octet-stream'
};

// Case-insensitive file path resolver
function findFilePathCaseInsensitive(requestedPath) {
  // If file exists with exact case, return it
  if (fs.existsSync(requestedPath)) {
    return requestedPath;
  }
  
  // Split into parts and try to match each part case-insensitively
  const parts = requestedPath.split(/[/\\]/);
  let currentPath = '.';
  
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    
    try {
      const entries = fs.readdirSync(currentPath);
      const match = entries.find(entry => entry.toLowerCase() === part.toLowerCase());
      
      if (match) {
        currentPath = path.join(currentPath, match);
      } else {
        // No match found, return original path (will result in 404)
        return requestedPath;
      }
    } catch (e) {
      return requestedPath;
    }
  }
  
  return currentPath;
}

// Create HTTPS server
const server = https.createServer(options, (req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Parse URL (remove query string)
  let urlPath = req.url.split('?')[0];

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // Handle API: Save characters.json
  if (req.method === 'POST' && urlPath === '/api/save-characters') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const filePath = path.join(__dirname, 'AR', 'data', 'characters.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ success: true }));
        console.log('✅ characters.json saved');
      } catch (err) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: err.message }));
        console.log('❌ Save failed:', err.message);
      }
    });
    return;
  }

  let filePath = '.' + urlPath;
  
  // Default to index.html for root
  if (filePath === './') {
    filePath = './index.html';
  } else if (filePath === './immersive' || filePath === './immersive/') {
    filePath = './immersive.html';
  }

  // Resolve case-insensitive path
  filePath = findFilePathCaseInsensitive(filePath);

  // If it's a directory without trailing slash, redirect to add the slash
  // This ensures relative paths in HTML resolve correctly
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory() && !urlPath.endsWith('/')) {
    res.writeHead(301, { 'Location': urlPath + '/' });
    res.end();
    return;
  }

  // Check if path is a directory, if so serve index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Get file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  // Check if file exists first
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - File Not Found</h1>', 'utf-8');
    return;
  }

  // Handle video files with range request support
  if (extname === '.mp4' || extname === '.webm' || extname === '.ogg') {
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;

      const file = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      file.pipe(res);
    } else {
      // No range requested - send full file
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Accept-Ranges': 'bytes',
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath).pipe(res);
    }
    return;
  }

  // Read and serve other files normally
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(500);
      res.end(`Server Error: ${error.code}`, 'utf-8');
    } else {
      // Add WebXR-friendly headers
      const headers = {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Permissions-Policy': 'xr-spatial-tracking=*, camera=*, microphone=*'
      };
      
      res.writeHead(200, headers);
      res.end(content, 'utf-8');
    }
  });
});

const PORT = 8443;
const HOST = '0.0.0.0';

// Function to launch URL via ADB
function launchADB(url) {
  console.log('\n🔌 Attempting to launch on Android device via ADB...');
  
  // Check if device is connected
  exec('adb devices', (error, stdout, stderr) => {
    if (error) {
      console.log('⚠️  ADB not found or not in PATH');
      return;
    }
    
    const lines = stdout.split('\n').filter(line => line.trim() && !line.includes('List of devices'));
    if (lines.length === 0) {
      console.log('⚠️  No Android devices connected via ADB');
      return;
    }
    
    console.log(`✅ Found ${lines.length} connected device(s)`);
    
    // Launch URL in Chrome on the device
    const adbCommand = `adb shell am start -a android.intent.action.VIEW -d "${url}"`;
    exec(adbCommand, (error, stdout, stderr) => {
      if (error) {
        console.log('⚠️  Failed to launch URL on device:', error.message);
      } else {
        console.log('✅ URL launched on Android device!');
      }
    });
  });
}

server.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  const url = `https://${localIP}:${PORT}`;
  
  console.log('\n==============================================');
  console.log('🚀 HTTPS Server Running!');
  console.log('==============================================');
  console.log(`Local:   https://localhost:${PORT}`);
  console.log(`Network: ${url}`);
  console.log('==============================================');
  console.log('\n⚠️  IMPORTANT: You will see a security warning');
  console.log('   Click "Advanced" → "Proceed to site"');
  console.log('   This is safe - it\'s your local server\n');
  console.log('📱 On your tablet, go to:');
  console.log(`   ${url}\n`);
  console.log('Press Ctrl+C to stop the server\n');
  
  // Launch on Android device via ADB
  launchADB(url);
});

// Also start HTTP server on port 8080 for WebXR Viewer
const httpHandler = (req, res) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);

  // Parse URL (remove query string)
  let urlPath = req.url.split('?')[0];
  let filePath = '.' + urlPath;
  
  if (filePath === './') {
    filePath = './index.html';
  } else if (filePath === './immersive' || filePath === './immersive/') {
    filePath = './immersive.html';
  }

  // Resolve case-insensitive path
  filePath = findFilePathCaseInsensitive(filePath);

  // If it's a directory without trailing slash, redirect to add the slash
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory() && !urlPath.endsWith('/')) {
    res.writeHead(301, { 'Location': urlPath + '/' });
    res.end();
    return;
  }

  // Check if path is a directory, if so serve index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  // Handle video/audio files with range request support (required for iOS)
  if (extname === '.mp4' || extname === '.mp3' || extname === '.webm' || extname === '.wav') {
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Accept-Ranges': 'bytes',
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath).pipe(res);
    }
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code, 'utf-8');
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content, 'utf-8');
    }
  });
};

const httpServer = http.createServer(httpHandler);
const HTTP_PORT = 8080;

httpServer.listen(HTTP_PORT, HOST, () => {
  const localIP = getLocalIP();
  console.log('\n==============================================');
  console.log('🔓 HTTP Server also running (for WebXR Viewer)');
  console.log('==============================================');
  console.log(`HTTP URL: http://${localIP}:${HTTP_PORT}`);
  console.log('==============================================\n');
});
