const path = require('path');

const rollupTypescript2 = require('rollup-plugin-typescript2');
const rollupResolve = require('rollup-plugin-node-resolve');
const rollupCommonjs = require('rollup-plugin-commonjs');
const rollupBuiltins = require('rollup-plugin-node-builtins');
const rollupGlobals = require('rollup-plugin-node-globals');
const rollupJson = require('rollup-plugin-json');
const rollupPeerDeps = require('rollup-plugin-peer-deps-external');

const { P, PKG_NAME, ENTRY_PATH, DESTINATION, FORMAT } = JSON.parse(process.env.rollup)

const config = {
  input: ENTRY_PATH,
  plugins: [
    rollupPeerDeps({
      packageJsonPath: path.resolve(P, 'package.json'),
      includeDependencies: true,
    }),
    rollupJson(),
    rollupResolve(),
    rollupCommonjs(),
    rollupGlobals(),
    rollupBuiltins(),
    rollupTypescript2({
      clean: true,
      rollupCommonJSResolveHack: true,
      tsconfig: path.resolve(P, 'tsconfig.json'),
    })
  ],

  output: {
    format: FORMAT,
    file: DESTINATION,
    name: PKG_NAME,
    globals: {
      lodash: '_',
    }
  },

  watch: {
    exclude: ['node_modules/**'],
    clearScreen: true,
  }
};

module.exports = config;
