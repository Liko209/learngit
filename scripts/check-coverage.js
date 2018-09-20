/*
 * @Author: Andy Hu
 * @Date: 2018-09-19 23:13:30
 * Copyright © RingCentral. All rights reserved.
 */

const { execSync } = require("child_process");
const chalk = require("chalk");

let currentBranch = execSync("git rev-parse --abbrev-ref HEAD")
  .toString()
  .match(/[\w/\-.]*/i)[0];

const isChange = execSync(
  `git diff origin/${currentBranch} -- config/coverage-threshold.json`
).toString();

if (isChange) {
  console.warn(
    chalk.blue.bgRed.white(
      "Found changes on config/coverage-threshold.json, Cheating on threshold is not allowed"
    )
  );
  process.exit(1);
}
