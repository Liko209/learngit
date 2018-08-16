"use strict";
/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-15 17:20:19
 * Copyright © RingCentral. All rights reserved.
 */
exports.__esModule = true;
var createTestCafe = require('testcafe');
var filter_1 = require("./libs/filter");
var config_1 = require("./config");
var testcafe = null;
createTestCafe()
    .then(function (tc) {
    testcafe = tc;
    var runner = testcafe.createRunner();
    return runner
        .src(config_1.FIXTURES)
        .browsers(config_1.BROWSERS)
        .filter(filter_1.filterByTags(config_1.INCLUDE_TAGS, config_1.EXCLUDE_TAGS))
        .run();
})
    .then(function (failedCount) {
    console.log('Tests failed: ' + failedCount);
    testcafe.close();
});
