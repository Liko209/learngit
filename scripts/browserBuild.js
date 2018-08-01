/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rollup = require('rollup').rollup;
const rollupTypescript2 = require('rollup-plugin-typescript2');
const rollupResolve = require('rollup-plugin-node-resolve');
const rollupCommonjs = require('rollup-plugin-commonjs');
const rollupBuiltins = require('rollup-plugin-node-builtins');
const rollupGlobals = require('rollup-plugin-node-globals');
const rollupJson = require('rollup-plugin-json');
const rollupPeerDeps = require('rollup-plugin-peer-deps-external');
const rollupUglify = require('rollup-plugin-uglify').uglify;
const rollupUglifyEs = require('rollup-plugin-uglify-es');
const rollupTslint = require('rollup-plugin-tslint');
const dtsGenerator = require('dts-generator');

function browserBuild(p, pkgName, entryPath, destination, format = 'umd', multipleEntry = false) {
  if (format === 'umd') {
    dtsGenerator.default({
      name: pkgName,
      main: `${pkgName}/index`,
      project: p,
      out: path.resolve(destination, '../index.d.ts'),
      resolveModuleId: params => {
        const { currentModuleId } = params;
        if (currentModuleId.indexOf('/index') !== -1) {
          return `${pkgName}/${currentModuleId.slice(0, currentModuleId.indexOf('/index'))}`;
        }
      }
    });
  }

  if (multipleEntry) {
    return new Promise((resolve) => {
      execSync(`tsc -p ${p} --outDir ${destination} --allowJs false -d`, { stdio: [0, 1, 2] });
      execSync(`node ./scripts/create-package-file.js ${p} ${destination}`, { stdio: [0, 1, 2] });
      resolve();
    })
  }

  return rollup({
    input: entryPath,
    plugins: [
      rollupPeerDeps({
        packageJsonPath: path.resolve(p, 'package.json'),
        includeDependencies: true,
      }),
      rollupTslint({
        tsConfigSearchPath: p,
      }),
      rollupJson(),
      rollupResolve(),
      rollupCommonjs(),
      rollupGlobals(),
      rollupBuiltins(),
      rollupTypescript2({
        clean: true,
        rollupCommonJSResolveHack: true,
        tsconfig: path.resolve(p, 'tsconfig.json'),
      })
      // ...(format === 'umd' ? [rollupUglify()] : [rollupUglifyEs()])
    ],
    watch: {
      exclude: ['node_modules/**'],
      clearScreen: true,
    }
  }).then(bundle =>
    bundle.write({
      format,
      file: destination,
      name: pkgName,
      globals: {
        lodash: '_',
      }
    })
  );
}

module.exports = browserBuild;
