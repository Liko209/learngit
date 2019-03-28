/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-15 17:20:19
 * Copyright © RingCentral. All rights reserved.
 */
import { getLogger } from 'log4js';

import { filterByTags } from './libs/filter';
import { RUNNER_OPTS } from './config';
import { accountPoolClient } from './init';

const logger = getLogger(__filename);
logger.level = 'info';

const createTestCafe = require('testcafe');

async function runTests(runnerOpts) {
  let failed = 0;
  const testCafe = await createTestCafe();
  const runner = testCafe.createRunner();
  logger.info(`runner options: ${JSON.stringify(runnerOpts, null, 2)}`);

  runner
    .src(runnerOpts.FIXTURES)
    .filter(filterByTags(runnerOpts.INCLUDE_TAGS, runnerOpts.EXCLUDE_TAGS))
    .browsers(runnerOpts.BROWSERS)
    .reporter(runnerOpts.REPORTER, process.stdout)
    .screenshots(runnerOpts.SCREENSHOTS_PATH, runnerOpts.SCREENSHOT_ON_FAIL)
    .concurrency(runnerOpts.CONCURRENCY);

  try {
    failed = await runner.run({
      quarantineMode: runnerOpts.QUARANTINE_MODE,
      skipUncaughtErrors: true,
      skipJsErrors: runnerOpts.SKIP_JS_ERROR,
      stopOnFirstFail: runnerOpts.STOP_ON_FIRST_FAIL,
      assertionTimeout: runnerOpts.ASSERTION_TIMEOUT,
    });
  } finally {
    await testCafe.close();
  }
  return failed;
}

(async function cli() {
  try {
    const failed = await runTests(RUNNER_OPTS);
    process.exitCode = failed > 0 ? 3 : 0;
  } catch (err) {
    logger.error(err);
    process.exitCode = 1;
  }
  await accountPoolClient.checkInAll();
  process.exit(process.exitCode);
})();
