/*
 * @Author: doyle.wu
 * @Date: 2019-02-18 13:45:26
 */

const path = require('path');
const fs = require('fs');

const result = {};

const fixedVersionsMap = {
  '@types/react-transition-group': ["2.0.15"],
  'terser-webpack-plugin': ["1.1.0"],
  'terser': ["3.16.1"]
};

const cacheDir = process.env.VERSION_CACHE_PATH || process.env.HOME || __dirname;
const buildId = process.env.BUILD_ID || '';

const maxDeleteTime = 7 * 24 * 60 * 60 * 1000;

const cachePath = path.join(cacheDir, '.jupiter');

if (!fs.existsSync(cachePath)) {
  fs.mkdirSync(cachePath);
}

console.log('cache path : ', cachePath);

const packageCacheName = 'package-cache.json';
const packageLockName = 'package-lock.json';

const writeFile = (fileName: string, data: string) => {
  let filePath;
  if (buildId !== '') {
    filePath = path.join(cachePath, buildId + '_' + fileName);
  } else {
    filePath = path.join(cachePath, fileName);
  }
  fs.writeFileSync(filePath, data);
}

const travelWorkspace = (dir: string) => {
  let fixModules = Object.keys(fixedVersionsMap);

  let files = fs.readdirSync(dir);

  for (let file of files) {
    let p = path.join(dir, file);
    if (fs.lstatSync(p).isDirectory()) {
      travelWorkspace(p);
      continue;
    }

    if (file !== 'package.json') {
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
          result[key][`${p}_dev`] = devDependencies[key];
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
    writeFile('versionDependency.json', JSON.stringify(result));
  }
}

const diffModuleVersion = (modules: {}) => {
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
  writeFile('versionDiff.json', JSON.stringify(diff));
}
const travelNodeModules = (modulesPath: string, dirPath: string, cache: {}) => {

  if (!fs.existsSync(dirPath)) {
    return;
  }

  let files = fs.readdirSync(dirPath);

  for (let file of files) {
    if (!fs.lstatSync(path.join(dirPath, file)).isDirectory()) {
      continue;
    }

    let filePath = path.join(dirPath, file, 'package.json');
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8');
      let json = JSON.parse(content);
      let moduleName = path.join(dirPath, file).substr(modulesPath.length + 1);
      cache[moduleName] = json['version'];
    } else {
      travelNodeModules(modulesPath, path.join(dirPath, file), cache);
    }
  }
}

const parseLockItem = (data: {}, item: {}, prefix: string) => {
  if (!item) {
    return;
  }

  let res = {};

  let requires = item['requires'];
  let dependencies = item['dependencies'];

  if (requires) {
    res['requires'] = requires;
  } else {
    res['requires'] = {};
  }
  res['version'] = item['version'];

  if (dependencies) {
    Object.keys(dependencies).forEach((k) => {
      parseLockItem(data, dependencies[k], prefix + '.' + k);
    });
  }

  data[prefix] = res;
}

const parseLockFile = (filePath: string): {} => {
  let content = fs.readFileSync(filePath, 'utf-8');
  let lock = JSON.parse(content);

  let {
    dependencies
  } = lock;
  let data = {};

  Object.keys(dependencies).forEach((k) => {
    parseLockItem(data, dependencies[k], k);
  });

  return data;
}

const diffLockVersion = () => {
  let now = parseLockFile(path.join(__dirname, packageLockName));
  let history = parseLockFile(path.join(cachePath, packageLockName));

  let diff = {};

  Object.keys(now).forEach((m) => {
    if (history[m]) {
      if (history[m]['version'] !== now[m]['version']) {
        diff[`* ${m}`] = `${history[m]['version']} -> ${now[m]['version']}`;
      }

      let nowRequires = now[m]['requires'];
      let historyRequires = history[m]['requires'];

      Object.keys(nowRequires).forEach((k) => {
        if (historyRequires[k]) {
          if (historyRequires[k] !== nowRequires[k]) {
            diff[`* ${m}|requires|${k}`] = `${historyRequires[k]} -> ${nowRequires[k]}`;
          }

          delete historyRequires[k];
        } else {
          diff[`+ ${m}|requires|${k}`] = nowRequires[k];
        }
      });

      Object.keys(historyRequires).forEach((k) => {
        if (!nowRequires[k]) {
          diff[`+ ${m}|requires|${k}`] = historyRequires[k];
        }
      })

      delete history[m];
    } else {
      diff[`+ ${m}`] = now[m]['version'];
    }
  });

  Object.keys(history).forEach((m) => {
    if (!now[m]) {
      diff[`- ${m}`] = history[m]['version'];
    }
  });

  console.log('package lock diff version: \n', diff);
  writeFile('versionLockDiff.json', JSON.stringify(diff));
}

const cacheVersion = () => {
  let dirPath = path.join(__dirname, 'node_modules');
  let cache = {};

  travelNodeModules(dirPath, dirPath, cache);

  diffModuleVersion(cache);

  diffLockVersion();

  fs.writeFileSync(path.join(cachePath, packageCacheName), JSON.stringify(cache));
}

const writeLockFile = () => {
  let lockFilePath = path.join(__dirname, packageLockName);
  let lockFileDestPath = path.join(cachePath, packageLockName);
  if (fs.existsSync(lockFilePath)) {
    fs.copyFileSync(lockFilePath, lockFileDestPath);
  }
}

const preHandler = () => {
  let lockFileDestPath = path.join(cachePath, packageLockName);
  if (!fs.existsSync(lockFileDestPath)) {
    writeLockFile();
  }

  let stat, filePath, deleteLine = Date.now() - maxDeleteTime;
  let files = fs.readdirSync(cachePath);
  for (let file of files) {
    filePath = path.join(cachePath, file);
    stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      continue;
    }

    if (file === packageCacheName || file === packageLockName) {
      continue;
    }

    if (stat.mtimeMs < deleteLine) {
      fs.unlinkSync(filePath);
    }
  }
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
    case 'pre':
      preHandler();
      break;
    default:
      console.log(`command [${opt}] don't match.`)
      break;
  }
})();
