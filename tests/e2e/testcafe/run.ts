/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-15 17:20:19
 * Copyright © RingCentral. All rights reserved.
 */
import { getLogger } from 'log4js';
import { v4 as uuid } from 'uuid';

import { filterByTags } from './libs/filter';
import { RUNNER_OPTS, ENABLE_REMOTE_DASHBOARD, RUN } from './config';
import { accountPoolClient, beatsClient } from './init';
import { Run } from './v2/helpers/bendapi-helper';

const logger = getLogger(__filename);
logger.level = 'info';

const createTestCafe = require('testcafe');

async function runTests(runnerOpts) {
  let failed = 0;
  const testCafe = await createTestCafe();
  const runner = testCafe.createRunner();
  logger.info(`runner options: ${JSON.stringify(runnerOpts, null, 2)}`);

  if (ENABLE_REMOTE_DASHBOARD) {
    // const run = await beatsClient.createRun({ "name": JSON.stringify(runnerOpts, null, 2) } as Run);
    const runName = RUN || uuid();
    const run = await beatsClient.createRun({
      name: runName,
      metadata: Object.keys(runnerOpts).filter((key) => (["FIXTURES", "REPORTER"]).indexOf(key) === -1).reduce((prev, cur) => Object.assign(prev, { [cur]: JSON.stringify(runnerOpts[cur]) }), {})
    } as Run)
  }

  runner
    .src(runnerOpts.FIXTURES)
    .filter(filterByTags(runnerOpts.INCLUDE_TAGS, runnerOpts.EXCLUDE_TAGS))
    .browsers(runnerOpts.BROWSERS)
    .reporter(runnerOpts.REPORTER, process.stderr)
    .reporter('spec', process.stdout)
    .screenshots(runnerOpts.SCREENSHOTS_PATH, runnerOpts.SCREENSHOT_ON_FAIL)
    .concurrency(runnerOpts.CONCURRENCY);

  try {
    failed = await runner.run({ quarantineMode: runnerOpts.QUARANTINE_MODE, skipUncaughtErrors: true, skipJsErrors: true });
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
