# cortex-init-prompts [![NPM version](https://badge.fury.io/js/cortex-init-prompts.svg)](http://badge.fury.io/js/cortex-init-prompts) [![Build Status](https://travis-ci.org/cortexjs/cortex-init-prompts.svg?branch=master)](https://travis-ci.org/cortexjs/cortex-init-prompts) [![Dependency Status](https://gemnasium.com/cortexjs/cortex-init-prompts.svg)](https://gemnasium.com/cortexjs/cortex-init-prompts)

Prompts asked when initializing a new cortex project.

## Install

```bash
npm install cortex-init-prompts --save
```

## Usage

```js
var prompts = require('cortex-init-prompts');
```

### prompts(options, callback)

- options `Object`
  - licenses `Array.<String>` available licenses.
  - skip `Object` list of `<properties>: <default-value>` which should be skipped. And `default-value` will the be answer of the skipped question.
  
- callback `function(answers)`
- answers `Object` the answers of user.

```js
prompts({
  license: ['MIT', 'BSD'],
  skip: {
    author_name: 'Swift'
  }
}, function(answers){
  answers.author_name; // 'Swift'
});
```
