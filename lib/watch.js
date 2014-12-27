var watch = require('chokidar').watch;
var args = process.argv.slice(2).join(' ');

watch(process.cwd() + '/' + args, { ignoreInitial: true }).on('all', function(evt, path) {
  console.log(path);
});
