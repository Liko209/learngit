/*
 * @Author: isaac.liu
 * @Date: 2019-07-26 13:39:09
 * Copyright © RingCentral. All rights reserved.
 */
const setupTimer = require('../jest/setup/timer');
require('../jest/setup/thirdParty');

afterAll(() => {
  setupTimer.tearDown();
  delete window.logger;
  global.gc && global.gc();
});
