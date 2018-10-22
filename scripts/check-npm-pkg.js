/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-7-19 10:23:03
 * Copyright © RingCentral. All rights reserved.
 */
const exec = require('child_process').execSync;
const pkgFile = require('../package.json')
const adminEmail = ['steve.chen@ringcentral.com', 'jeffery.huang@ringcentral.com', 'steven.zhuang@ringcentral.com']
const admin = ['Steve Chen', 'Jeffrey Huang', 'Steven Zhuang'];

function checkGitUser() {
  let gitUser = {};
  try{
    gitUser.name = exec('git config --get user.name');
    gitUser.email = exec('git config --get user.email')
  } catch (e) {console.log(e.message)}
  gitUser.name = gitUser.name && JSON.stringify(gitUser.name.toString().trim()).slice(1, -1);
  gitUser.email = gitUser.email && (gitUser.email.toString().toLocaleLowerCase().trim());
  return gitUser
}
function checkDiff(){
  try{
    let isChange = exec('git diff --cached package.json').toString()
    if(isChange) {
      let changed = exec('git diff --cached package.json | grep \'^[+|-][^+|-]\'\n').toString();
      let files = changed.split("\n");
      let matched = files.map((item) => {
        return item && item.match(/"(.*?)"\s*:/) ? item.match(/"(.*?)"\s*:/)[1] : null;
      })
      const dep = pkgFile.dependencies;
      const devDep = pkgFile.devDependencies;
      let deRepeatArray = Array.from(new Set(matched))
      let modified = deRepeatArray && deRepeatArray.map((item) => {
        return (dep && dep.hasOwnProperty(item) || devDep && devDep.hasOwnProperty(item))
      });
      let foundModified = modified.filter(item => {
        return item === true;
      });
      let gitUser = checkGitUser()
      if(modified.indexOf(true) > -1 && adminEmail.indexOf(gitUser.email) === -1 && !(deRepeatArray.includes('sdk') && foundModified.length === 1)) {
          const chalk = require('chalk');
          console.log()
          console.warn(chalk.bgRed.dim(' Warning ') + ' '+ chalk.blue('You seem to be adding or upgrading a npm package'))
          console.warn(chalk.blue(`          Please make sure you have discuss with one of ${chalk.yellow(admin)} `))
          console.log(chalk.blue('          For more detail,please see https://git.ringcentral.com/Fiji/Fiji-docs/blob/develop/Docs/Process/NormailzedNpmPackage.md'))
          console.log()
          process.exit(1)
      }
    }
  } catch (e) {console.log(e.message)}
}
checkDiff()
