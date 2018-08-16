/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-15 17:20:19
 * Copyright © RingCentral. All rights reserved.
 */

declare function require(name:string): any;
const createTestCafe = require('testcafe');


import { filterByTags } from './libs/filter';
import { FIXTURES, BROWSERS, INCLUDE_TAGS, EXCLUDE_TAGS } from './config';

let testcafe: any         = null;

createTestCafe()
    .then((tc: any) => {
        testcafe     = tc;
        const runner = testcafe.createRunner();

      return runner
        .src(FIXTURES)
        .browsers(BROWSERS)
        .filter(filterByTags(INCLUDE_TAGS, EXCLUDE_TAGS))
        .run();
    })
    .then((failedCount: any) => {
        console.log('Tests failed: ' + failedCount);
        testcafe.close();
    });
