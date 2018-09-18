/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-09-17 18:26:44
 * Copyright © RingCentral. All rights reserved.
 */

import { mockLoginRequest } from './mockLogin';

export function setUp(accountType?: string) {
  return async (t: TestController) => {
    await t.addRequestHooks(mockLoginRequest());
  };
}

export function tearDown() {
  return async (t: TestController) => {};
}
