/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:43:27
 * Copyright © RingCentral. All rights reserved.
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

const filenameToMid = (function () {
  if (path.sep === '/') {
    return function (filename) {
      return filename;
    };
  } else {
    const separatorExpression = new RegExp(path.sep.replace('\\', '\\\\'), 'g');
    return function (filename) {
      return filename.replace(separatorExpression, '/');
    };
  }
})();

function browserBuild(p, pkgName, entryPath, destination, format = 'umd', multipleEntry = false) {
  if (!multipleEntry) {
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
      },
      resolveModuleImport: params => {
        const { importedModuleId, currentModuleId } = params;
        const index = importedModuleId.search(/\.d$/);
        if (index !== -1) {
          const resolved = `${pkgName}/${filenameToMid(path.join(path.dirname(currentModuleId), importedModuleId.slice(0, index)))}`;
          return  resolved;
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
    ]
  }).then(bundle =>
    bundle.write({
      format:"cjs",
      file: destination,
      name: pkgName,
      globals: {
        lodash: '_',
      }
    })
  );
}

module.exports = browserBuild;
