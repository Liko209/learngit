/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Watch files for changes and rebuild (copy from 'src/' to `build/`) if changed
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const chalk = require('chalk');
const getPackages = require('./getPackages');

const argv = process.argv.slice(2);
const BUILD_CMD = `npx rollup --config config/rollup.config.js --watch`;

if (!argv.length) {
  process.stdout.write(`${chalk.red('No Package specified.')}\n`);
  process.exit(1);
}

const { SRC_DIR } = require('./build');

const packages = getPackages();

let p;

packages.some((pkg) => {
  if (path.basename(pkg) === argv[0]) {
    p = pkg;
    return true;
  }
  return false;
});

const srcDir = path.resolve(p, SRC_DIR);
const pkgJsonPath = path.resolve(p, 'package.json');

if (!fs.existsSync(pkgJsonPath)) {
  return;
}

const { main } = require(pkgJsonPath);

if (p.indexOf('ui') !== -1) {
  execSync(`tsc -p ${p} --outDir ${path.resolve(p, main)} --allowJs false -d --watch`, { stdio: [0, 1, 2] });
  return;
}

process.env.rollup = JSON.stringify({
  P: p,
  PKG_NAME: p.split('/').pop(),
  ENTRY_PATH: path.resolve(srcDir, 'index.ts'),
  DESTINATION: path.resolve(p, main),
  FORMAT: 'esm',
})
execSync(`${BUILD_CMD}`, { stdio: [0, 1, 2] });
