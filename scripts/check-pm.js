/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-7-17 11:01:02
 * Copyright © RingCentral. All rights reserved.
 */
const spawn  = require('child_process').spawnSync

function checkYarnInstalled() {
  const command = spawn('yarn', ['--version'])
  return command && command.stdout && command.stdout.toString().trim()
}
const execPath = process.env.npm_execpath;
const isYarn = execPath && execPath.indexOf('yarn') > -1;
function log(...msg) {
  console.log(...msg)
}
function cyan(...msg) {
  const chalk = require('chalk');
  console.log(chalk && chalk.cyan(...msg))
}
if (!isYarn) {
  if(checkYarnInstalled()) {
    cyan('You have yarn installed, please use yarn to install all dependencies')
    log()
    log('To install dependencies:')
    cyan('$ yarn')
    log()
    log('To install a new package:')
    cyan('$ yarn add [packageName]')
    log()
    cyan('For more help, see https://yarnpkg.com/en/docs/usage.')

    process.exit(1)
  } else {
    cyan(`    To say goodbye to the "but it works on my machine" bugs, you should use yarn install dependencies,
    try ${chalk.underline.yellow.bold('brew install yarn')} to install yarn first`);
    log();
    cyan('For more help, see https://yarnpkg.com/en/docs/usage.');
    log()
    process.exit(1)
  }
}
