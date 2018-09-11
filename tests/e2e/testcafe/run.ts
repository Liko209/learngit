/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-15 17:20:19
 * Copyright © RingCentral. All rights reserved.
 */

const createTestCafe = require('testcafe');
const TerminationHandler = require('testcafe/lib/cli/termination-handler');

import { filterByTags } from './libs/filter';
import { flattenGlobs, parseArgs } from './libs/utils';
import { accountPoolClient } from './libs/accounts';
import { EXECUTION_STRATEGIES_HELPER as STRATEGY } from './config';

const REPORTER = process.env.REPORTER || 'allure-lazy';
const SCREENSHOTS_PATH = process.env.SCREENSHOTS_PATH || '/tmp';
const SCREENSHOT_ON_FAIL = String(process.env.SCREENSHOT_ON_FAIL).trim().toLowerCase() === 'false' ? false : true;
const CONCURRENCY = process.env.CONCURRENCY || '1';
const FIXTURES = flattenGlobs(process.env.FIXTURES ? parseArgs(process.env.FIXTURES) : STRATEGY.fixtures);
const BROWSERS = process.env.BROWSERS ? parseArgs(process.env.BROWSERS) : STRATEGY.browsers;
const INCLUDE_TAGS = process.env.INCLUDE_TAGS ? parseArgs(process.env.INCLUDE_TAGS) : STRATEGY.includeTags;
const EXCLUDE_TAGS = process.env.EXCLUDE_TAGS ? parseArgs(process.env.EXCLUDE_TAGS) : STRATEGY.excludeTags;

let showMessageOnExit = true;
let exitMessageShown = false;
let exiting = false;

function exitHandler(terminationLevel) {
  if (showMessageOnExit && !exitMessageShown) {
    exitMessageShown = true;
    console.log('Stopping TestCafe...');
    process.on('exit', () => console.log('TestCafe stopped'));
  }
  if (exiting || terminationLevel < 2) {
    return;
  }
  exiting = true;
  exit(0);
}

function exit(code) {
  setTimeout(() => process.exit(code), 0);
}

function error(err) {
  console.log(String(err));
  exit(1);
}

async function runTests() {
  let failed = 0;
  const testCafe = await createTestCafe();
  const runner = testCafe.createRunner();

  console.log(`Final config: fixtures = ${JSON.stringify(FIXTURES)}`);
  console.log(`Final config: include_tags = ${JSON.stringify(INCLUDE_TAGS)}`);
  console.log(`Final config: exclude_tags = ${JSON.stringify(EXCLUDE_TAGS)}`);
  console.log(`Final config: browsers = ${JSON.stringify(BROWSERS)}`);

  runner
    .src(FIXTURES)
    .filter(filterByTags(INCLUDE_TAGS, EXCLUDE_TAGS))
    .browsers(BROWSERS)
    .reporter(REPORTER, process.stderr)
    .reporter('spec', process.stdout)
    .screenshots(SCREENSHOTS_PATH, SCREENSHOT_ON_FAIL)
    .concurrency(Number(CONCURRENCY));

  runner.once('done-bootstrapping', () => console.log('running...'));

  try {
    failed = await runner.run({ quarantineMode: false });
  } finally {
    await testCafe.close();
    await accountPoolClient.checkInAll();
  }
  console.log(`${failed} failed cases are found`);
  exit(failed > 0 ? 2 : 0);
}

(async function cli() {
  const terminationHandler = new TerminationHandler();

  terminationHandler.on(TerminationHandler.TERMINATION_LEVEL_INCREASED_EVENT, exitHandler);

  try {
    await runTests();
  } catch (err) {
    showMessageOnExit = false;
    error(err);
  }
})();
