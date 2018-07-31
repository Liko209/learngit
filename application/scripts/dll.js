// No need to build the DLL in production
process.env.NODE_ENV = 'development';

require('shelljs/global');

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

const exists = fs.existsSync;
const writeFile = fs.writeFileSync;

const defaults = require('lodash/defaultsDeep');

const paths = require('../config/paths');
const appPackage = require(paths.appPackageJson);

const dllPlugin = require('../config/dll');

const dllConfig = dllPlugin.defaults;
const outputPath = dllConfig.path;
const dllManifestPath = path.join(outputPath, 'package.json');

/**
 * I use node_modules/boilerplate-dlls by default just because
 * it isn't going to be version controlled and babel wont try to parse it.
 */
// eslint-disable-next-line
mkdir('-p', outputPath);

// eslint-disable-next-line
console.log(chalk.green('Building the Webpack DLL...'));

/**
 * Create a manifest so npm install doesn't warn us
 */
if (!exists(dllManifestPath)) {
  writeFile(
    dllManifestPath,
    JSON.stringify(
      defaults({
        name: 'boilerplate-dlls',
        private: true,
        author: appPackage.author,
        repository: appPackage.repository,
        version: appPackage.version
      }),
      null,
      2
    ),
    'utf8'
  );
}

// the BUILDING_DLL env var is set to avoid confusing the development environment
// eslint-disable-next-line
exec(
  'BUILDING_DLL=true webpack --display-chunks --color --config config/webpack.config.dll.js --hide-modules'
);
