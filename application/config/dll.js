/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 11:02:26
 * Copyright © RingCentral. All rights reserved.
 */
const fs = require('fs');
const { resolve } = require('path');
const pullAll = require('lodash/pullAll');
const uniq = require('lodash/uniq');

/**
 * The DLL Plugin provides a dramatic speed increase to webpack build and hot module reloading
 * by caching the module metadata for all of our npm dependencies. We enable it by default
 * in development.
 *
 *
 * To disable the DLL Plugin, set this value to false.
 */
dllPlugin = {
  defaults: {
    /**
     * we need to exclude dependencies which are not intended for the browser
     * by listing them here.
     */
    exclude: ['sdk', 'jui', 'typeface-roboto', 'framework'],

    /**
     * Specify any additional dependencies here. We include core-js and lodash
     * since a lot of our dependencies depend on them and they get picked up by webpack.
     */
    include: ['core-js', 'lodash'],

    // The path where the DLL manifest and bundle will get built
    path: resolve(
      fs.realpathSync(process.cwd()),
      'node_modules/boilerplate-dlls',
    ),
  },

  entry(pkg) {
    const dependencyNames = Object.keys(pkg.dependencies);
    const exclude = dllPlugin.defaults.exclude;
    const include = dllPlugin.defaults.include;
    const includeDependencies = uniq(dependencyNames.concat(include));

    return {
      boilerplateDeps: pullAll(includeDependencies, exclude),
    };
  },
};

module.exports = dllPlugin;
