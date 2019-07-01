/*
 * @Author: isaac.liu
 * @Date: 2019-07-01 13:44:53
 * Copyright © RingCentral. All rights reserved.
 */
import { Wrapper } from './wrapper';

class TestApp extends Wrapper {
  get leftNav() {
    return this.findByAutomationID('leftPanel', true);
  }

  get aboutDialog() {
    return this.findByAutomationID('about-page-dialog', true);
  }
}

export { TestApp };
