/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-15 17:20:19
 * Copyright © RingCentral. All rights reserved.
 */

const createTestCafe = require('testcafe');
const TerminationHandler = require('testcafe/lib/cli/termination-handler');

import { filterByTags } from './libs/filter';
import { flattenGlobs, parseArgs } from './libs/utils';

const FIXTURES = flattenGlobs(parseArgs(process.env.FIXTURES || `${__dirname}/../fixtures/**/*.ts`));
const REPORTER = process.env.REPORTER || 'allure-lazy';
const SCREENSHOTS_PATH = process.env.SCREENSHOTS_PATH || '/tmp';
const CONCURRENCY = process.env.CONCURRENCY || '1';
const BROWSERS = parseArgs(process.env.BROWSERS || 'chrome');
const INCLUDE_TAGS = parseArgs(process.env.INCLUDE_TAGS || '');
const EXCLUDE_TAGS = parseArgs(process.env.EXCLUDE_TAGS || '');

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

  runner
    .src(FIXTURES)
    .filter(filterByTags(INCLUDE_TAGS, EXCLUDE_TAGS))
    .browsers(BROWSERS)
    .reporter(REPORTER)
    .screenshots(SCREENSHOTS_PATH)
    .concurrency(Number(CONCURRENCY));

  // runner.once('done-bootstrapping', () => console.log('running...'));

  try {
    failed = await runner.run();
  } finally {
    await testCafe.close();
  }
  exit(failed);
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
