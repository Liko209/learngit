/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:42:08
 * Copyright © RingCentral. All rights reserved.
 */
'use strict';

// This is a custom Jest transformer turning style imports into empty objects.
// http://facebook.github.io/jest/docs/en/webpack.html

module.exports = {
  process() {
    return 'module.exports = {};';
  },
  getCacheKey() {
    // The output is always the same.
    return 'cssTransform';
  },
};
