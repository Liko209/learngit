/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-21 14:21:20
 * Copyright © RingCentral. All rights reserved.
 */
const { execSync, spawn } = require('child_process');

function findChangedFiles() {
  return execSync('git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD')
    .toString()
    .split('\n');
}

function findChangedPackages() {
  return findChangedFiles().filter(path => path.includes('package.json'));
}

function isPackageChanged() {
  return findChangedPackages().length > 0;
}

if (isPackageChanged()) {
  console.log('package.json changed');
  console.log(findChangedPackages().join('\n'));
  const childProcess = spawn('npm', ['install'], { stdio: 'inherit' });

  childProcess.on('exit', () => process.exit());
  process.on('SIGINT', () => childProcess.kill('SIGINT'));
} else {
  console.log('package.json not changed');
  process.exit();
}
