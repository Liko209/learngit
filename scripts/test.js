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
  argv.indexOf('--watchAll') === -1
) {
  argv.push('--watch');
}

const packages = getPackages();

if (argv.length) {
  packages.filter(p =>
    argv.includes(path.basename(p))
  ).forEach((p) => {
    argv.push(p);
  });
}


jest.run(argv);
