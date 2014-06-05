/*
 * grunt-init
 * https://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

var spawn = require('./spawn');

// Get the git origin url from the current repo (if possible).
exports.origin = function(callback) {
  spawn('git remote -v', function (err, result) {
    var re = /^origin\s/;
    var lines;
    if (!err) {
      lines = String(result).split('\n').filter(re.test, re);
      if (lines.length > 0) {
        return callback(lines[0].split(/\s/)[1]);
      }
    }
    callback(null);
  });
};

// Get the given key from the git config, if it exists.
exports.config = function(key, callback) {
  spawn('git config --get ' + key, function (err, result) {
    callback( err ? null : String(result).trim() );
  });
};