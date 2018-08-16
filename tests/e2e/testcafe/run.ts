/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-15 17:20:19
 * Copyright © RingCentral. All rights reserved.
 */

const createTestCafe = require('testcafe');
import * as _ from 'lodash';
import * as G from 'glob';
import { filterByTags } from './libs/filter';

function parseArgs(argsString: string) {
  return argsString.split(',').filter(Boolean).map(s => s.trim());
}

function flattenGlobs(globs: Array<string>): Array<string> {
  return _(globs).flatMap(g => G.sync(g)).uniq().value();
}

const FIXTURES = flattenGlobs(parseArgs(process.env.FIXTURES || `${__dirname}/../fixtures/**/*.ts`));
const REPORTER = process.env.REPORTER || 'allure-lazy';
const SCREENSHOTS_PATH = process.env.SCREENSHOTS_PATH || '/tmp/';
const CONCURRENCY = process.env.CONCURRENCY || 1;
const BROWSERS = parseArgs(process.env.BROWSERS || 'chrome');
const INCLUDE_TAGS = parseArgs(process.env.INCLUDE_TAGS || '');
const EXCLUDE_TAGS = parseArgs(process.env.EXCLUDE_TAGS || '');

let testcafe: any = null;

createTestCafe()
  .then((tc: any) => {
    testcafe = tc;
    const runner = testcafe.createRunner();
    return runner
      .src(FIXTURES)
      .filter(filterByTags(INCLUDE_TAGS, EXCLUDE_TAGS))
      .browsers(BROWSERS)
      .reporter(REPORTER)
      .screenshots(SCREENSHOTS_PATH)
      .concurrency(CONCURRENCY)
      .run();
  })
  .then((failedCount: any) => {
    console.log('Tests failed: ' + failedCount);
    testcafe.close();
  })
  .catch((error: any) => {
    console.log(`${error}`);
    testcafe.close();
  });
