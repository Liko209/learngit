/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';
const fs = require('fs');
const path = require('path');

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

function browserBuild(p, pkgName, entryPath, destination, format = 'umd') {
  if (format === 'umd') {
    dtsGenerator.default({
      name: pkgName,
      main: `${pkgName}/index`,
      project: p,
      out: path.resolve(p, 'build/index.d.ts'),
      resolveModuleId: params => {
        const { currentModuleId } = params;
        if (currentModuleId.indexOf('/index') !== -1) {
          return `${pkgName}/${currentModuleId.slice(0, currentModuleId.indexOf('/index'))}`;
        }
      }
    });
  }
  return rollup({
    input: entryPath,
    plugins: [
      rollupPeerDeps({
        packageJsonPath: path.resolve(p, 'package.json'),
        includeDependencies: true,
      }),
      // rollupTslint({
      //   configuration: path.resolve(p, 'tsconfig.json')
      // }),
      rollupJson(),
      rollupResolve(),
      rollupCommonjs(),
      rollupGlobals(),
      rollupBuiltins(),
      rollupTypescript2({
        clean: true,
        rollupCommonJSResolveHack: true
      })
      // ...(format === 'umd' ? [rollupUglify()] : [rollupUglifyEs()])
    ]
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
