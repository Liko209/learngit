/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-15 17:20:19
 * Copyright © RingCentral. All rights reserved.
 */
import { getLogger } from 'log4js';

import { filterByTags, readTestLog } from './libs/filter';
import { RUNNER_OPTS } from './config';
import { accountPoolClient, finishRun } from './init';
import * as assert from 'assert';

const logger = getLogger(__filename);
logger.level = 'info';

const createTestCafe = require('testcafe');
const selfSignedCert = require('openssl-self-signed-certificate');

const sslOptions = RUNNER_OPTS.ENABLE_SSL ? {
  key: selfSignedCert.key,
  cert: selfSignedCert.cert
} : undefined;

async function runTests(runnerOpts) {
  let failed = 0;
  const testCafe = await createTestCafe(runnerOpts.TESTCAFE_HOST, undefined, undefined, sslOptions);
  const runner = testCafe.createRunner();
  logger.info(`runner options: ${JSON.stringify(runnerOpts, null, 2)}`);
  assert(runnerOpts.FIXTURES && runnerOpts.FIXTURES.length > 0, 'fixtures should not be empty!');

  runner
    .src([`${__dirname}/.dummy-test.ts`, ...runnerOpts.FIXTURES])
    .filter(filterByTags(runnerOpts.INCLUDE_TAGS, runnerOpts.EXCLUDE_TAGS, runnerOpts.CASE_FILTER, readTestLog(runnerOpts.TESTS_LOG)))
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
      debugOnFail: runnerOpts.DEBUG_ON_FAIL,
    });
  } finally {
    logger.info(`runner exit with ${failed} failed cases`);
    await finishRun().catch(error => logger.error(error));
    logger.info(`start to close testcafe`);
    await testCafe.close();
    logger.info(`testcafe stop`);
  }
  return failed;
}

(async function cli() {
  try {
    const failed = await runTests(RUNNER_OPTS);
    logger.info(`test exit normally`);
    await finishRun().catch(error => logger.error(error));
    process.exitCode = failed > 0 ? 3 : 0;
  } catch (err) {
    logger.error(err);
    process.exitCode = 1;
  }
  await accountPoolClient.checkInAll();
  process.exit(process.exitCode);
})();
