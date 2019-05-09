const chalk = require("chalk");
const msgPath = process.env.HUSKY_GIT_PARAMS;
const msg = require("fs")
  .readFileSync(msgPath, "utf-8")
  .trim();
const commitRE = /^(feat|fix|docs|style|refactor|test|chore|revert)\(RCINT-\d+\):\s\[.+\]\s.+/;
const mergeRE = /^(Merge (.*?) into (.*?)|(Merge branch (.*?))(?:\r?\n)*$)/;

if (!commitRE.test(msg) && !mergeRE.test(msg)) {
  console.log();
  console.error(
    `  ${chalk.bgRed.dim(" ERROR ")} ${chalk.red(
      `invalid commit message format.`
    )}\n\n` +
      chalk.red(
        `  Proper commit message format is required for automated changelog generation. Examples:\n\n`
      ) +
      `    ${chalk.green(
        `feat(Jira ticket number): [summary] 'add comments'`
      )}\n\n` +
      chalk.red(
        `  You can also use ${chalk.cyan(
          `yarn commit`
        )} to interactively generate a commit message.\n`
      )
  );
  process.exit(1);
}
