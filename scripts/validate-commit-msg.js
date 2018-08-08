/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-7-18 15:08:02
 * Copyright © RingCentral. All rights reserved.
 */
const chalk = require('chalk')
const msgPath = process.env.GIT_PARAMS
const msg = require('fs').readFileSync(msgPath, 'utf-8').trim()

const commitRE = /^(feat|fix|docs|style|refactor|test|chore|revert)(\(.+\))?: /

if (!commitRE.test(msg)) {
  console.log()
  console.error(
    `  ${chalk.bgRed.dim(' ERROR ')} ${chalk.red(`invalid commit message format.`)}\n\n` +
    chalk.red(`  Proper commit message format is required for automated changelog generation. Examples:\n\n`) +
    `    ${chalk.green(`feat(your scope): 'add comments'`)}\n` +
    `    ${chalk.green(`fix(FIJI-476 scripts): 'subject can't be skipped'`)}\n` +
    `    ${chalk.green(`test: 'scope can be ignored'`)}\n\n` +
    chalk.red(`  You can also use ${chalk.cyan(`npm run commits`)} to interactively generate a commit message.\n`)
  )
  process.exit(1)
}
