var os = require('os');
var fs = require('fs');

var platforms = {
  linux: [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ],
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/opt/homebrew-cask/Caskroom/google-chrome/stable-channel/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/opt/homebrew-cask/Caskroom/google-chrome/latest/Google Chrome.app/Contents/MacOS/Google Chrome'
  ],
  windows: [
    '/Program Files/Google/Chrome/Application/chrome.exe',
    '/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  ]
};

module.exports = whichChrome;

function whichChrome(env) {
  env = env || process.env;

  var chrome = {};
  var platform = os.platform();
  var dirs = platforms[platform];

  if (!dirs)
    throw new Error('Unknown OS ' + platform);

  chrome.bin = dirs.reduce(function(bin, candidate) {
    return bin || fs.existsSync(candidate) && candidate
  }, null);

  if (!chrome.bin)
    throw new Error('Google Chrome was not found');

  chrome.dataDir = platform === 'windows'
                 ? (env.LOCALAPPDATA || env.USERPROFILE) + '/unicode'
                 : (env.HOME || '~') + '/.unicode';

  return chrome;
}
