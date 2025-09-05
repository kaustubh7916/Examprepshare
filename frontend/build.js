const { execSync } = require('child_process');
const path = require('path');

console.log('Building with Vite...');

try {
  // Use npx to run vite build
  execSync('npx --yes vite@latest build', {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
