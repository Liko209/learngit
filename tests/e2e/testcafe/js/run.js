"use strict";
/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-15 17:20:19
 * Copyright © RingCentral. All rights reserved.
 */
exports.__esModule = true;
var createTestCafe = require('testcafe');
var filter_1 = require("./libs/filter");
var utils_1 = require("./libs/utils");
var FIXTURES = utils_1.flattenGlobs(utils_1.parseArgs(process.env.FIXTURES || __dirname + "/../fixtures/**/*.ts"));
var REPORTER = process.env.REPORTER || 'allure-lazy';
var SCREENSHOTS_PATH = process.env.SCREENSHOTS_PATH || '/tmp/';
var CONCURRENCY = process.env.CONCURRENCY || '1';
var BROWSERS = utils_1.parseArgs(process.env.BROWSERS || 'chrome');
var INCLUDE_TAGS = utils_1.parseArgs(process.env.INCLUDE_TAGS || '');
var EXCLUDE_TAGS = utils_1.parseArgs(process.env.EXCLUDE_TAGS || '');
var testcafe = null;
createTestCafe()
    .then(function (tc) {
    testcafe = tc;
    var runner = testcafe.createRunner();
    return runner
        .src(FIXTURES)
        .filter(filter_1.filterByTags(INCLUDE_TAGS, EXCLUDE_TAGS))
        .browsers(BROWSERS)
        .reporter(REPORTER)
        .screenshots(SCREENSHOTS_PATH)
        .concurrency(parseInt(CONCURRENCY))
        .run();
})
    .then(function (failedCount) {
    console.log('Tests failed: ' + failedCount);
    testcafe.close();
})["catch"](function (error) {
    console.log("" + error);
    testcafe.close();
});
