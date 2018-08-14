/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-7-17 10:29:02
 * Copyright © RingCentral. All rights reserved.
 */
const execSync = require('child_process').execSync;
const chalk = require('chalk');

try {
  execSync('yarn check').toString();
} catch (error) {
  console.log(
    '\n' +
    chalk.red(`  This project uses ${chalk.underline.bold('yarn')} to install all dependencies.\n`) +
    chalk.red(`  Please don't modify the dependencies manually in package.json nor use npm install [package-name] to update them.\n`) +
    chalk.dim('    To install any new dependency,please run:\n') +
    chalk.cyan('    $ yarn add [package-name]\n') +
    chalk.dim('    or to upgrade a dependency to a specific version:\n') +
    chalk.cyan('    $ yarn upgrade [package@version]\n') +
    chalk.yellow(
      '    If you got this error,please execute yarn and try again.\n'
    ) +
    chalk.dim('    Check out ') +
    chalk.underline.blue('https://yarnpkg.com/en/docs/cli/') +
    chalk.dim(' for more information.') +
    `\n`
  );
  process.exit(1);
  throw error;
}
