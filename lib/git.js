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

// Generate a GitHub web URL from a GitHub repo URI.
var REGEX_GITHUB_URL = /^.+(?:@|:\/\/)(github.com)[:\/](.+?)(?:\.git|\/)?$/;

exports.githubUrl = function(uri, suffix) {
  if (!uri) {
    return null;
  }

  var matches = REGEX_GITHUB_URL.exec(uri);
  if (!matches) {
    return null;
  }

  var url = 'https://' + matches[1] + '/' + matches[2];

  if (suffix) {
    url += '/' + suffix.replace(/^\//, '');
  }

  return url;
};

// Get the given key from the git config, if it exists.
exports.config = function(key, callback) {
  spawn('git config --get ' + key, function (err, result) {
    callback( err ? null : String(result).trim() );
  });
};