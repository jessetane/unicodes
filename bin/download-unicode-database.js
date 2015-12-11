#!/usr/bin/env node

var fs = require('fs')
var request = require('hyperquest')

request('http://unicode.org/Public/UNIDATA/UnicodeData.txt')
  .pipe(fs.createWriteStream(__dirname + '/../public/UnicodeData.txt'))
