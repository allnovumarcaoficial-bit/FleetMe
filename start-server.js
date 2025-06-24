const { spawn } = require('child_process');

const child = spawn('npx', ['next', 'start'], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error(`spawn error: ${error}`);
});

child.on('exit', (code, signal) => {
  console.log(`child process exited with code ${code} and signal ${signal}`);
});
