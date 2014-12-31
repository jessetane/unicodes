var args = process.argv.slice(2).join(' ');

require('chokidar').watch(process.cwd() + '/' + args, { ignoreInitial: true }).on('all', function(evt, path) {
  console.log(path);
});
