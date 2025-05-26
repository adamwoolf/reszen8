// start.js
const fs = require('fs');
const { spawn } = require('child_process');

// Log to a file for debugging
const logStream = fs.createWriteStream('server-debug.log', { flags: 'a' });
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  logStream.write(logMessage);
  console.log(logMessage);
};

log('Starting server...');

const server = spawn('node', ['server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

server.stdout.on('data', (data) => {
  log(`stdout: ${data}`);
});

server.stderr.on('data', (data) => {
  log(`stderr: ${data}`);
});

server.on('close', (code) => {
  log(`child process exited with code ${code}`);
  if (code !== 0) {
    log('Server crashed, restarting in 2 seconds...');
    setTimeout(() => server = spawn('node', ['server.js']), 2000);
  }
});

process.on('SIGINT', () => {
  log('Stopping server...');
  server.kill();
  logStream.end();
  process.exit();
});