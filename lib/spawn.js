'use strict';

var spawn = require('child_process').spawn;

module.exports = function (command, callback) {
  var args = command.split(/\s+/);
  var main = args.shift();

  var called;
  function once (err, result) {
    if (called) {
      return;
    }

    called = true;

    callback(err, result);
  }

  var child = spawn(main, args);
  var result;

  child.stdout.on('data', function (data) {
    result = data;
  });

  child.stderr.on('data', function (data) {
    once(data);
  });

  child.on('close', function (code) {
    if (code) {
      return once('child process exited with code ' + code); 
    }

    once(null, result);
  });
}