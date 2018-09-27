/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-15 17:20:19
 * Copyright © RingCentral. All rights reserved.
 */

import { filterByTags } from './libs/filter';
import { getLogger } from 'log4js';

import { RUNNER_OPTS } from './config';
import { accountPoolClient } from './libs/accounts';

const logger = getLogger(__filename);
logger.level = 'info';

const createTestCafe = require('testcafe');

async function runTests(runnerOpts) {
  let failed = 0;
  const testCafe = await createTestCafe();

  // ensure testcafe exit on abnormal exit
  const events: any[] = ['uncaughtException', 'SIGINT', 'SIGTERM',];
  events.forEach(e => {
    process.on(e, () => {
      logger.info(`close testcafe on ${e}`);
      testCafe.close();
    });
  });

  const runner = testCafe.createRunner();
  logger.info(`runner options: ${JSON.stringify(runnerOpts, null, 2)}`);

  runner
    .src(runnerOpts.FIXTURES)
    .filter(filterByTags(runnerOpts.INCLUDE_TAGS,runnerOpts.EXCLUDE_TAGS))
    .browsers(runnerOpts.BROWSERS)
    .reporter(runnerOpts.REPORTER, process.stderr)
    .reporter('spec', process.stdout)
    .screenshots(runnerOpts.SCREENSHOTS_PATH, runnerOpts.SCREENSHOT_ON_FAIL)
    .concurrency(runnerOpts.CONCURRENCY);


  try {
    failed = await runner.run({ quarantineMode: runnerOpts.QUARANTINE_MODE });
  } finally {
    await testCafe.close();
  }
  return failed;
}

(async function cli() {
  let exitCode = 0;
  try {
    const failed = await runTests(RUNNER_OPTS);
    exitCode = failed > 0 ? 1 : 0;
  } catch (err) {
    logger.error(err);
    exitCode = 127;
  }
  await accountPoolClient.checkInAll();
  process.exit(exitCode);
})();
