/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * script to build (transpile) files.
 * By default it transpiles all files for all packages and writes them
 * into `build/` directory.
 * Non-js or files matching IGNORE_PATTERN will be copied without transpiling.
 *
 * Example:
 *  node ./scripts/build.js
 *  node ./scripts/build.js /users/123/jest/packages/jest-111/src/111.js
 *
 * NOTE: this script is node@4 compatible
 */

'use strict';

const fs = require('fs');
const path = require('path');

const chalk = require('chalk');
const stringLength = require('string-length');
const getPackages = require('./getPackages');
const browserBuild = require('./browserBuild');

const OK = chalk.reset.inverse.bold.green(' DONE ');
const SRC_DIR = 'src';
const BUILD_DIR = 'build';
const BUILD_ES_DIR = 'build-es';
const IGNORE_PATTERN = '**/__{tests,mocks}__/**';
const PACKAGES_DIR = path.resolve(__dirname, '../packages');

const adjustToTerminalWidth = str => {
  const columns = process.stdout.columns || 80;
  const WIDTH = columns - stringLength(OK) + 1;
  const strings = str.match(new RegExp(`(.{1,${WIDTH}})`, 'g'));
  let lastString = strings[strings.length - 1];
  if (lastString.length < WIDTH) {
    lastString += Array(WIDTH - lastString.length).join(chalk.dim('.'));
  }
  return strings
    .slice(0, -1)
    .concat(lastString)
    .join('\n');
};

function getPackageName(file) {
  return path.relative(PACKAGES_DIR, file).split(path.sep)[0];
}

function getBuildPath(file, buildFolder) {
  const pkgName = getPackageName(file);
  const pkgSrcPath = path.resolve(PACKAGES_DIR, pkgName, SRC_DIR);
  const pkgBuildPath = path.resolve(PACKAGES_DIR, pkgName, buildFolder);
  const relativeToSrcPath = path.relative(pkgSrcPath, file);
  return path.resolve(pkgBuildPath, relativeToSrcPath);
}

function buildBrowserPackage(p, format = 'umd') {
  const srcDir = path.resolve(p, SRC_DIR);
  const pkgJsonPath = path.resolve(p, 'package.json');

  if (!fs.existsSync(pkgJsonPath)) {
    return;
  }

  const { main, module: moduleEntry } = require(pkgJsonPath);
  const entry = format === 'esm' ? moduleEntry : main;
  const fieldName = format === 'esm' ? 'module' : 'main';
  const buildDir = format === 'esm' ? BUILD_ES_DIR : BUILD_DIR;

  if (entry) {
    if (entry.indexOf(buildDir) !== 0) {
      throw new Error(
        `${fieldName} field for ${pkgJsonPath} should start with "${buildDir}"`
      );
    }
  }

  return browserBuild(
    p,
    p.split('/').pop(),
    path.resolve(srcDir, 'index.ts'),
    path.resolve(p, entry),
    format
  ).then(() => {
    process.stdout.write(adjustToTerminalWidth(`${path.basename(p)} - ${format}\n`));
    process.stdout.write(`${OK}\n`);
  }).catch(e => {
    console.error(e);
    process.exit(1);
  });
}

async function build(packages) {
  for (let i = 0; i < packages.length; i++) {
    const p = packages[i];
    await Promise.all([
      buildBrowserPackage(p, 'esm'),
      buildBrowserPackage(p),
    ])
  }
}

const packages = getPackages();
const files = process.argv.slice(2);

if (files.length) {
  build(packages.filter(p =>
    files.includes(path.basename(p))
  ))
} else {
  process.stdout.write(chalk.inverse(' Building packages \n'));
  build(packages);
}
