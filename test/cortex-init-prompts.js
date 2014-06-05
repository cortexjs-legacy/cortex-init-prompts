'use strict';

var expect = require('chai').expect;
var prompts = require('../');

function data () {
  return {
    name: 'neuropil',
    version: '0.1.0',
    description: 'The coolest cortex module.',
    main: 'index.js',
    repository: 'https://github.com/kaelzhang/node-neuropil',
    keywords: [],
    license: 'MIT',
    author_name: 'kaelzhang',
    author_email: 'i@kael.me'
  };
}

describe("prompts.clean(data, defaults)", function() {
  it("will clean", function(){
    var d = data();
    var cleaned = prompts.clean(d, {
      author_name: 'kael'
    });

    expect(cleaned.bugs.url).to.equal('http://github.com/kaelzhang/node-neuropil/issues');
    expect(cleaned.homepage).to.equal('http://github.com/kaelzhang/node-neuropil');
  });
});


describe("prompts._parseSchemas()", function(){
  it("defaults", function(){
    var schemas = prompts.PROMPT_SCHEMAS;

    var parsed = prompts._parseSchemas(schemas, {
      licenses: ['MIT'],
      skip: {
        author_name: 'kael'
      }
    });

    var found = parsed.some(function (schema) {
      if (schema.name === 'author_name') {
        return true;
      }
    });

    expect(found).to.equal(false);
  });
});