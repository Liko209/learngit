/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-21 14:21:20
 * Copyright © RingCentral. All rights reserved.
 */
const fs = require('fs-extra');
const { execSync, spawn } = require('child_process');

function findChangedFiles() {
  return execSync('git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD')
    .toString()
    .split('\n');
}

function findChangedPackages() {
  return findChangedFiles().some(path => path.includes('package-lock.json'));
}

function isPackageChanged() {
  return findChangedPackages().length > 0;
}

if (isPackageChanged()) {
  console.log('package-lock.json changed');
  console.log(findChangedPackages().join('\n'));
  const childProcess = spawn('npm', ['install'], { stdio: 'inherit' });

  childProcess.on('exit', () => process.exit());
  process.on('SIGINT', () => childProcess.kill('SIGINT'));
} else {
  console.log('package-lock.json not changed');
  process.exit();
}
