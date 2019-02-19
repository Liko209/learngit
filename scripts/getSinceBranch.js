/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-02-19 11:09:29
 * Copyright © RingCentral. All rights reserved.
 */
const { execSync } = require("child_process");

try {
  const currentBranch = execSync("git rev-parse --abbrev-ref HEAD").toString();
  const isCurrentBranchInRemote = execSync(
    `git ls-remote --heads git@git.ringcentral.com:Fiji/Fiji.git ${currentBranch}`
  ).toString();
  if (isCurrentBranchInRemote) {
    process.stdout.write(`origin/${currentBranch}`);
  } else {
    process.stdout.write(`develop`);
  }
} catch (error) {
  console.log(`error: ${error}`);
  process.exit(1);
}
