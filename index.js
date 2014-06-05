// 'use strict';

module.exports = prompt;

var asks = require('asks');
var semver = require('semver');
var node_path = require('path');
var node_url = require('url');
var util = require('util');
var github = require('githuburl');

var spawn = require('./lib/spawn');
var git = require('./lib/git');


// @param {Object} options
// - licenses
// - skip {Object} <name>: <default>
function prompt (options, callback) {
  var schemas = prompt._parseSchemas(PROMPT_SCHEMAS, options);
  asks.prompt(schemas, function (result) {
    prompt.clean(result, options.skip);
    callback(result);
  });
}


prompt.clean = function (pkg, defaults) {
  var key;
  var value;
  for (key in defaults) {
    pkg[key] = defaults[key];
  }

  if (!pkg.author) {
    var author_name = pkg.author_name;
    var author_email = pkg.author_email;
    delete pkg.author_name;
    delete pkg.author_email;

    pkg.author = {
      name: author_name,
      email: author_email
    };
  }

  var parsed_repo = github(pkg.repository);
  pkg.bugs = {
    url: parsed_repo.http_href + '/issues'
  };

  pkg.homepage = parsed_repo.http_href;
  pkg.engines = {
    neuron: '*',
  };
  pkg.devDependencies = {
    assert: '*'
  };

  return pkg;
};


prompt._ensureExt = function(path, ext) {
  var regex = new RegExp('\\.' + ext + '$', 'i');

  if (!regex.test(path)) {
    path += '.' + ext;
  }

  return path;
};


prompt._parseSchemas = function (schemas, options) {
  var key;
  var schema;
  var results = [];
  var skip = options.skip;
  for (key in schemas) {
    if (!(key in skip)) {
      schema = prompt._schemaWarning(schemas[key]);
      schema.name = key;
      if (key === 'license' && options.licenses) {
        schema.choices = options.licenses;
      }

      results.push(schema);
    }
  }

  return results;
};


prompt._schemaWarning = function (schema) {
  var validate = schema.validate;
  var warning = schema.warning;

  if (typeof validate !== 'function' && warning) {
    if (!util.isRegExp(validate)) {
      validate = /^.+$/;
    }

    schema.validate = function (value) {
      var done = this.async();
      if (!validate.test(value)) {
        return done(warning);
      }
      done(true);
    };
  }

  delete schema.warning;
  return schema;
};


var PROMPT_SCHEMAS = {
  name: {
    type: 'input',
    message: 'Project name',
    default: function(answers) {
      var name = node_path.basename(process.cwd()).replace(/[\.-_]+js$/i, '');
      // Remove anything not a letter, number, dash, dot or underscore.
      name = name.replace(/[^\w\-\.]/g, '');
      return name;
    },
    validate: function (name) {
      var done = this.async();

      if (!/^[a-z0-9\-\.]+$/.test(name)) {
        done('Must be only lowercased letters, numbers, dashes, dots or underscores.');
      }

      if (!/^[a-z]/.test(name)) {
        return done('Must start with a lowercased letter.');
      }

      if (!/[a-z0-9]$/.test(name)) {
        return done('Must end with a letter or number.');
      }
      
      // Weird that inquirer requires a `true` passed to `done` as a success.
      done(true);
    }
  },

  version: {
    message: 'Version',
    default: function(answers) {
      var done = this.async();

      spawn('git describe --tags', function (err, tag) {
        var firstVersion = '0.1.0';
        if (err) {
          return done(firstVersion);
        }

        done(semver.valid(tag) || firstVersion);
      });
    },
    validate: function (version) {
      var done = this.async();

      if (!semver.valid(version)) {
        return done('Must be a valid semantic version (semver.org).');
      }

      done(true);
    }
  },

  description: {
    message: 'Description',
    default: 'The coolest cortex module.'
  },

  main: {
    message: 'Main module/entry point(optional)',
    default: 'index.js',
    validate: function (value) {
      // optional
      if (!value) {
        return true;
      }

      if (value.indexOf('../') === 0) {
        return 'Main entry point should not be outside the project.'
      }

      return true;
    },
    filter: function (main) {
      main = main.trim();

      // default value of package.main must be a `.js` file
      return prompt._ensureExt(main || 'index.js', 'js');
    }
  },

  repository: {
    message: 'Project git repository',
    default: function(answers) {
      var done = this.async();

      git.origin(function (origin) {
        if (origin) {
          // Ssh url needs much more configuration to clone 
          // Change any `git@...:... uri` to `git://.../...` format.
          origin = origin.replace(/^git@([^:]+):/, 'git://$1/');
          return done(origin);
        }

        git.config('github.user', function (user) {
          if (!user) {
            // Attempt to guess at the repo user name. Maybe we'll get lucky!
            user = process.env.USER || process.env.USERNAME || '???';
          }

          // Save as git_user for sanitize step.
          // answers.git_user = user;

          origin = 'git://github.com/' + user + '/' + node_path.basename(process.cwd()) + '.git';
          done(origin);
        });
      });
    },
    validate: function (value) {
      var parsed = github(value);
      return !!parsed.host;
    },
    filter: function(repository) {
      return github(repository).git_clone_url;
    },
    warning: 'Should be a public git URI.'
  }, 

  keywords: {
    message: 'Keywords',
    filter: function (keywords) {
      if (typeof keywords !== 'string') {
        return [];
      }

      keywords = keywords.split(/\s+|,/g)
      .map(function (keyword) {
        return keyword.trim();
      })
      .filter(Boolean);

      return keywords;
    },
    warning: 'To make your package easier to search, plz add some keywords.'
  },

  license: {
    message: 'License',
    default: 'MIT',
    type: 'list',
    choices: [
      'MIT',
      'BSD'
    ]
  }, 

  author_name: {
    message: 'Author name',
    default: function (answers) {
      var done = this.async();
      git.config('user.name', done);
    },
    warning: 'May consist of any characters.'
  }, 

  author_email: {
    message: 'Author email',
    default: function (answers) {
      var done = this.async();
      git.config('user.email', done);
    },
    warning: 'Should be a valid email address.'
  }
};

prompt.PROMPT_SCHEMAS = PROMPT_SCHEMAS;
