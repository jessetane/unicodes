var spawn = require('child_process').spawn;
var chrome = require('../lib/which-chrome')();

process.env.SERVER_PORT = process.env.SERVER_PORT || 50000 + ~~(Math.random() * 10000);

var gui = spawn(chrome.bin, [
  '--user-data-dir=' + chrome.dataDir,
  '--app=http://localhost:' + process.env.SERVER_PORT,
  '--window-size=480,320',
  '--disk-cache-size 0',
  '--no-proxy-server',
]);

gui.on('exit', function(status) { process.exit(status) });

if (process.env.NODE_ENV !== 'production') {
  gui.stdout.pipe(process.stdout);
  gui.stderr.pipe(process.stderr);
}

require('./server');
