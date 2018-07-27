/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-06-24 13:58:09
 * Copyright © RingCentral. All rights reserved
*/

import TestService from '../__mocks__/services/TestService';

describe('Abstract Service', () => {
  it('Service life cycle', () => {
    const testService = new TestService();
    expect(testService.isStarted()).toBeFalsy();
    testService.start();
    expect(testService.isStarted()).toBeTruthy();
    testService.stop();
    expect(testService.isStarted()).toBeFalsy();
  });
});
