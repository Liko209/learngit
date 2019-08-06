/*
 * @Author: isaac.liu
 * @Date: 2019-07-26 13:39:09
 * Copyright © RingCentral. All rights reserved.
 */
const setupTimer = require('../jest/setup/timer');

afterAll(() => {
  setupTimer.tearDown();
  global.gc && global.gc();
});
