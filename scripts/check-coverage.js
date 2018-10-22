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

const thresholdFromDev = JSON.parse(
  execSync(`git show origin/develop:config/coverage-threshold.json`).toString()
).global;

const localThreshold = require("../config/coverage-threshold.json").global;

const hasLoweredLocally = Object.keys(thresholdFromDev).some(
  (criteria) => localThreshold[criteria] < thresholdFromDev[criteria]
);

if (hasLoweredLocally) {
  console.log(chalk.red("You have your local coverage threshold lowered"));
  process.exit(1);
}
