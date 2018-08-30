/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-7-17 11:01:02
 * Copyright © RingCentral. All rights reserved.
 */
const execPath = process.env.npm_execpath;
const isNpm = execPath && execPath.indexOf("npm") > -1;
function log(...msg) {
  console.log(...msg);
}
function cyan(...msg) {
  const chalk = require("chalk");
  console.log(chalk && chalk.cyan(...msg));
}
if (!isNpm) {
  cyan('please use npm to install all dependencies')
  log()
  log('To install dependencies:')
  cyan('$ npm i')
  log()
  cyan('For more help, see https://docs.npmjs.com/.')

  process.exit(1)
}
