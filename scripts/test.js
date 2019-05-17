/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:44:54
 * Copyright © RingCentral. All rights reserved.
 */
'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'test';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
const path = require('path');
const jest = require('jest');
const getPackages = require('./getPackages');

let argv = process.argv.slice(2);

// Watch unless on CI, in coverage mode, or explicitly running all tests
if (
  !process.env.CI &&
  argv.indexOf('--coverage') === -1 &&
  argv.indexOf('--watchAll') === -1 &&
  !argv.find(value => value.indexOf('--changedSince') !== -1)
) {
  argv.push('--watch');
}

const packages = getPackages();

if (argv.length) {
  packages
    .filter(p => argv.includes(path.basename(p)))
    .forEach(p => {
      argv.push(p);
    });
}

switch (true) {
  case argv.includes('application'):
    process.env.APP = '<rootDir>/application';
    break;
  case argv.includes('sdk'):
    process.env.APP = '<rootDir>/packages/sdk';
    break;
  case argv.includes('foundation'):
    process.env.APP = '<rootDir>/packages/foundation';
    break;
  case argv.includes('jui'):
    process.env.APP = '<rootDir>/packages/jui';
    break;
  case argv.includes('voip'):
    process.env.APP = '<rootDir>/packages/voip';
    break;
  case argv.includes('rcui'):
    process.env.APP = '<rootDir>/packages/rcui';
    break;
  default:
    process.env.APP =
      '<rootDir>/(application|packages/sdk|packages/foundation|packages/voip|packages/jui|packages/rcui|packages/framework)';
    break;
}

jest.run(argv);
