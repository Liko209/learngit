const { execSync } = require("child_process");

try {
  let currentBranch = execSync("git rev-parse --abbrev-ref HEAD").toString();
  isCurrentBranchInRemote = execSync(
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
