import clear from 'rollup-plugin-clear';
import svgr from '@svgr/rollup';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import url from 'rollup-plugin-url';
import replace from 'rollup-plugin-replace';
import copy from 'rollup-plugin-copy';

import fs from 'fs';

// @ts-ignore
import pkg from './package.json'

const targetDir = 'dist';

const writePackageJson = () => {
  return {
    generateBundle() {
      const output = {
        name: pkg.name,
        version: pkg.version,
        main: pkg.main,
        typings: `index.d.ts`,
        dependencies: pkg.dependencies,
        peerDependencies: pkg.peerDependencies,
        sideEffects: false
      };

      fs.writeFileSync('./dist/package.json', JSON.stringify(output, null, 2));
    }
  };
};

export default {
  external: [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
    '@material-ui/core/styles',
  ],
  input: 'src/index.ts',
  output: [
    {
      dir: targetDir,
      format: 'es',
      exports: 'named',
      sourcemap: false
    },
  ],
  plugins: [
    clear({
      targets: [targetDir],
      watch: true,
    }),
    external(),
    postcss({
      modules: true
    }),
    url({ exclude: ['**/*.svg'] }),
    svgr(),
    json(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    resolve(),
    typescript({
      rollupCommonJSResolveHack: true,
      clean: true,
      tsconfig: 'tsconfig.build.json'
    }),
    commonjs(),
    copy({
      targets: [
        'README.md'
      ],
      outputFolder: targetDir
    }),
    writePackageJson()
  ]
}
