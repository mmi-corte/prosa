const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '..', 'service-worker.js');
const cacheNameRegex = /const CACHE_NAME = 'cache-prosa-game-v(\d+)';/;

if (!fs.existsSync(swPath)) {
  console.error('service-worker.js not found');
  process.exit(1);
}

const swContent = fs.readFileSync(swPath, 'utf8');
const match = swContent.match(cacheNameRegex);

if (!match) {
  console.error('CACHE_NAME pattern not found in service-worker.js');
  process.exit(1);
}

const currentVersion = Number.parseInt(match[1], 10);
if (!Number.isFinite(currentVersion)) {
  console.error('Invalid CACHE_NAME version in service-worker.js');
  process.exit(1);
}

const nextVersion = currentVersion + 1;
const updatedContent = swContent.replace(
  cacheNameRegex,
  `const CACHE_NAME = 'cache-prosa-game-v${nextVersion}';`
);

fs.writeFileSync(swPath, updatedContent, 'utf8');
console.log(`CACHE_NAME bumped: v${currentVersion} -> v${nextVersion}`);
