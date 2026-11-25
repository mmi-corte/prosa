const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const EDITOR_TOKEN = process.env.PROSA_EDITOR_TOKEN || 'prosa-editor-dev';
const MAX_SAVE_BODY = 2 * 1024 * 1024;
const RANGE_EXTENSIONS = new Set(['.mp4', '.webm', '.ogg', '.mp3', '.wav', '.m4a']);

// Generate self-signed certificate. node-forge is installed in AR/ for the AR
// server, so fall back to that copy when running this server from the repo root.
let forge;
try {
  forge = require('node-forge');
} catch (err) {
  forge = require('./AR/node_modules/node-forge');
}
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
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'application/font-woff',
  '.woff2': 'font/woff2',
  '.ogg': 'audio/ogg',
  '.aac': 'audio/aac',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.mind': 'application/octet-stream'
};

// Check that a resolved path stays inside the served directory
function isInsideRoot(candidate, root) {
  return candidate === root || candidate.startsWith(root + path.sep);
}

// Case-insensitive file path resolver (never returns a path outside __dirname)
function findFilePathCaseInsensitive(requestedPath) {
  const root = path.resolve(__dirname);
  const resolved = path.resolve(requestedPath);
  if (!isInsideRoot(resolved, root)) {
    return root;
  }

  // If file exists with exact case, return it
  if (fs.existsSync(resolved)) {
    return resolved;
  }

  // Match each segment case-insensitively, starting from the root
  const relative = path.relative(root, resolved);
  if (!relative) return root;
  const parts = relative.split(/[/\\]/).filter(Boolean);
  let currentPath = root;

  for (const part of parts) {
    try {
      const entries = fs.readdirSync(currentPath);
      const match = entries.find(entry => entry.toLowerCase() === part.toLowerCase());
      if (!match) {
        // No match found - keep the in-root path (will result in 404)
        return resolved;
      }
      currentPath = path.join(currentPath, match);
    } catch (e) {
      return resolved;
    }
  }

  return currentPath;
}

// Decode and resolve a request pathname, rejecting malformed or traversal paths
function resolveRequestPath(urlPath, res) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(urlPath);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('400 - Bad Request');
    return null;
  }

  if (decodedPath === '/' || decodedPath === '') {
    decodedPath = '/index.html';
  } else if (decodedPath === '/immersive' || decodedPath === '/immersive/') {
    decodedPath = '/immersive.html';
  }

  let filePath = path.resolve(__dirname, '.' + decodedPath);
  if (!isInsideRoot(filePath, __dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 - Forbidden');
    return null;
  }

  filePath = findFilePathCaseInsensitive(filePath);
  if (!isInsideRoot(filePath, __dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 - Forbidden');
    return null;
  }

  return filePath;
}

// Parse a strict Range header: bytes=start-end, bytes=start-, or bytes=-suffix
function parseByteRange(rangeHeader, fileSize) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
  if (!match || (!match[1] && !match[2])) return null;

  let start;
  let end;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix <= 0 || fileSize === 0) return null;
    start = Math.max(0, fileSize - suffix);
    end = fileSize - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : fileSize - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) return null;
  }

  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) return null;
  if (start < 0 || start > end || end >= fileSize) return null;
  return { start, end };
}

// Stream a file with an error handler so stream failures cannot crash the process
function pipeFile(filePath, res, options) {
  const file = fs.createReadStream(filePath, options);
  file.on('error', err => {
    console.error('Stream error:', err.message);
    if (!res.headersSent) {
      res.writeHead(500);
      res.end('Server Error');
    } else {
      res.destroy(err);
    }
  });
  file.pipe(res);
}

// Authenticated editor save endpoint (shared by HTTPS and HTTP handlers)
function handleSaveCharacters(req, res) {
  if (req.headers['x-editor-token'] !== EDITOR_TOKEN) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }

  const chunks = [];
  let bodyLength = 0;
  let tooLarge = false;

  req.on('data', chunk => {
    if (tooLarge) return;
    bodyLength += chunk.length;
    if (bodyLength > MAX_SAVE_BODY) {
      tooLarge = true;
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Payload too large' }));
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });

  req.on('end', () => {
    if (tooLarge) return;

    let data;
    try {
      data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      console.log('❌ Save failed: invalid JSON');
      return;
    }

    if (!data || typeof data !== 'object' || Array.isArray(data) ||
        !Object.prototype.hasOwnProperty.call(data, 'version') ||
        !Object.prototype.hasOwnProperty.call(data, 'settings') ||
        !Array.isArray(data.characters)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid characters data' }));
      console.log('❌ Save failed: invalid characters data');
      return;
    }

    try {
      const filePath = path.join(__dirname, 'AR', 'data', 'characters.json');
      const tmpPath = filePath + '.tmp';
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tmpPath, filePath);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
      console.log('✅ characters.json saved');
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      console.log('❌ Save failed:', err.message);
    }
  });
}

// Create HTTPS server
const server = https.createServer(options, (req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Parse URL (remove query string)
  let urlPath = req.url.split('?')[0];

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Editor-Token'
    });
    res.end();
    return;
  }

  // Handle API: Save characters.json
  if (req.method === 'POST' && urlPath === '/api/save-characters') {
    handleSaveCharacters(req, res);
    return;
  }

  // Decode, resolve and validate the requested path
  const filePath = resolveRequestPath(urlPath, res);
  if (!filePath) return;

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

  // Handle video/audio files with range request support
  if (RANGE_EXTENSIONS.has(extname)) {
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parsedRange = parseByteRange(range, fileSize);
      if (!parsedRange) {
        res.writeHead(416, {
          'Content-Range': `bytes */${fileSize}`,
          'Accept-Ranges': 'bytes'
        });
        res.end();
        return;
      }
      const { start, end } = parsedRange;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      pipeFile(filePath, res, { start, end });
    } else {
      // No range requested - send full file
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Accept-Ranges': 'bytes',
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      pipeFile(filePath, res);
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

const PORT = Number(process.env.PORT) || 8443;
const HOST = '0.0.0.0';

// Function to launch URL via ADB (opt-in with PROSA_ADB=1)
function launchADB(url) {
  if (process.env.PROSA_ADB !== '1') {
    console.log('ℹ️  ADB launch skipped (set PROSA_ADB=1 to enable)');
    return;
  }

  console.log('\n🔌 Attempting to launch on Android device via ADB...');
  
  // Check if device is connected
  execFile('adb', ['devices'], (error, stdout, stderr) => {
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
    execFile('adb', ['shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', url], (error, stdout, stderr) => {
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

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Editor-Token'
    });
    res.end();
    return;
  }

  // Handle API: Save characters.json
  if (req.method === 'POST' && urlPath === '/api/save-characters') {
    handleSaveCharacters(req, res);
    return;
  }

  // Decode, resolve and validate the requested path
  const filePath = resolveRequestPath(urlPath, res);
  if (!filePath) return;

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
  if (RANGE_EXTENSIONS.has(extname)) {
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
      const parsedRange = parseByteRange(range, fileSize);
      if (!parsedRange) {
        res.writeHead(416, {
          'Content-Range': `bytes */${fileSize}`,
          'Accept-Ranges': 'bytes'
        });
        res.end();
        return;
      }
      const { start, end } = parsedRange;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      pipeFile(filePath, res, { start, end });
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Accept-Ranges': 'bytes',
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      pipeFile(filePath, res);
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
const HTTP_PORT = Number(process.env.HTTP_PORT) || 8080;

httpServer.listen(HTTP_PORT, HOST, () => {
  const localIP = getLocalIP();
  console.log('\n==============================================');
  console.log('🔓 HTTP Server also running (for WebXR Viewer)');
  console.log('==============================================');
  console.log(`HTTP URL: http://${localIP}:${HTTP_PORT}`);
  console.log('==============================================\n');
});
