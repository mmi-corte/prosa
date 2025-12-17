const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Generate self-signed certificate
const forge = require('node-forge');
const pki = forge.pki;

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
  value: 'localhost'
}, {
  name: 'countryName',
  value: 'US'
}, {
  shortName: 'ST',
  value: 'Virginia'
}, {
  name: 'localityName',
  value: 'Blacksburg'
}, {
  name: 'organizationName',
  value: 'Test'
}, {
  shortName: 'OU',
  value: 'Test'
}];

cert.setSubject(attrs);
cert.setIssuer(attrs);
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
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.mind': 'application/octet-stream'
};

// Create HTTPS server
const server = https.createServer(options, (req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Parse URL
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  } else if (filePath === './immersive' || filePath === './immersive/') {
    filePath = './immersive.html';
  }

  // Get file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  // Read and serve file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content, 'utf-8');
    }
  });
});

const PORT = 8443;
const HOST = '0.0.0.0';

// Function to get local IP address
function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '172.20.3.86'; // Fallback to hardcoded IP
}

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
