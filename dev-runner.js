const { spawn } = require('child_process');

console.log('Starting Next.js dev server in Webpack mode...');

const env = {
  ...process.env,
  PATH: '/Users/rovicki/Documents/Project/farm-fajar/node-bin/bin:' + (process.env.PATH || ''),
  NEXT_TELEMETRY_DISABLED: '1'
};

// Pass --webpack flag to Next.js
const child = spawn('node', ['node_modules/next/dist/bin/next', 'dev', '--webpack'], {
  env,
  stdio: ['pipe', 'pipe', 'pipe']
});

child.stdout.on('data', (data) => {
  process.stdout.write(data.toString());
});

child.stderr.on('data', (data) => {
  process.stderr.write('ERROR: ' + data.toString());
});

child.on('exit', (code) => {
  console.log(`\nNext.js exited with code ${code}`);
});

// Keep the wrapper process alive indefinitely
setInterval(() => {
  // no-op
}, 5000);
