/*
 * @Author: doyle.wu
 * @Date: 2019-02-18 13:45:26
 */

const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;

const result = {};

const fixedVersionsMap = {
  '@types/react-transition-group': ["2.0.15"],
  'terser-webpack-plugin': ["1.1.0"],
  'terser': ["3.16.1"]
};

const cachePath = process.env.VERSION_CACHE_PATH || process.env.HOME || __dirname;

const packageCacheName = 'package-cache.json';

const travelWorkspace = (dir: string) => {
  let fixModules = Object.keys(fixedVersionsMap);

  let files = fs.readdirSync(dir);

  for (let file of files) {
    let p = path.join(dir, file);
    if (fs.lstatSync(p).isDirectory()) {
      travelWorkspace(p);
      continue;
    }

    if (file.name !== 'package.json') {
      continue;
    }

    let content = fs.readFileSync(p, 'utf-8');
    let json = JSON.parse(content);
    let {
      dependencies, devDependencies
    } = json;

    if (dependencies) {
      for (let key of Object.keys(dependencies)) {
        if (fixModules.indexOf(key) > -1) {
          if (!result[key]) {
            result[key] = {};
          }
          result[key][p] = dependencies[key];
        }
      }
    }

    if (devDependencies) {
      for (let key of Object.keys(devDependencies)) {
        if (fixModules.indexOf(key) > -1) {
          if (!result[key]) {
            result[key] = {};
          }
          result[key][p] = devDependencies[key];
        }
      }
    }
  }
}

const checkVersion = () => {
  console.log('check module version ...');
  let fixModules = Object.keys(fixedVersionsMap);
  for (let m of fixModules) {
    let filePath = path.join(__dirname, 'node_modules', m, 'package.json');

    if (!fs.existsSync(filePath)) {
      console.log(`${filePath} don't exist.`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    let json = JSON.parse(content);
    let allowVersion = fixedVersionsMap[m];
    if (allowVersion.indexOf(json['version']) > -1) {
      delete fixedVersionsMap[m];
      console.log(`module [${m}], version: ${json['version']}, result: success.`);
    } else {
      console.log(`module [${m}], version: ${json['version']}, result: fail.`);
    }
  }

  travelWorkspace(__dirname);

  if (Object.keys(result).length > 0) {
    console.log(result);
  }
}

const diffVersion = (modules: {}) => {
  let filePath = path.join(cachePath, packageCacheName);
  if (!fs.existsSync(filePath)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let history = JSON.parse(content);

  let diff = {};
  Object.keys(modules).forEach((m) => {
    if (history[m]) {
      if (history[m] !== modules[m]) {
        diff[`* ${m}`] = `${history[m]} -> ${modules[m]}`;
      }

      delete history[m];
    } else {
      diff[`+ ${m}`] = modules[m];
    }
  });

  Object.keys(history).forEach((m) => {
    if (!modules[m]) {
      diff[`- ${m}`] = history[m];
    }
  });

  console.log('package diff version: \n', diff);
}
const travelNodeModules = (modulesPath: string, dirPath: string, cache: {}) => {

  if (!fs.existsSync(dirPath)) {
    return;
  }

  let files = fs.readdirSync(dirPath, { withFileTypes: true });

  for (let file of files) {
    if (fs.lstatSync(path.join(dirPath, file)).isDirectory()) {
      continue;
    }

    let filePath = path.join(dirPath, file.name, 'package.json');
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8');
      let json = JSON.parse(content);
      let moduleName = path.join(dirPath, file.name).substr(modulesPath.length + 1);
      cache[moduleName] = json['version'];
    } else {
      travelNodeModules(modulesPath, path.join(dirPath, file.name), cache);
    }
  }
}
const cacheVersion = () => {
  let dirPath = path.join(__dirname, 'node_modules');
  let cache = {};

  travelNodeModules(dirPath, dirPath, cache);

  diffVersion(cache);

  fs.writeFileSync(path.join(cachePath, packageCacheName), JSON.stringify(cache));
}

(() => {
  let argv = process.argv, opt = 'check';
  if (argv && argv.length >= 3) {
    opt = argv[2];
  }
  switch (opt) {
    case 'cache':
      cacheVersion();
      break;
    case 'check':
      checkVersion();
      break;
    default:
      console.log(`command [${opt}] don't match.`)
      break;
  }
})();
