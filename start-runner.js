const { spawn } = require('child_process');

console.log('Starting Next.js production server with inherited stdio...');

const env = {
  ...process.env,
  PATH: '/Users/rovicki/Documents/Project/farm-fajar/node-bin/bin:' + (process.env.PATH || ''),
  NEXT_TELEMETRY_DISABLED: '1'
};

// Use inherit stdio to bypass piped buffer SIGBUS issues
const child = spawn('node', ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1'], {
  env,
  stdio: ['ignore', 'inherit', 'inherit']
});

child.on('close', (code, signal) => {
  console.log(`\nNext.js close: code=${code}, signal=${signal}`);
});

child.on('exit', (code, signal) => {
  console.log(`\nNext.js exit: code=${code}, signal=${signal}`);
});

// Keep the wrapper process alive indefinitely
setInterval(() => {
  // no-op
}, 5000);
