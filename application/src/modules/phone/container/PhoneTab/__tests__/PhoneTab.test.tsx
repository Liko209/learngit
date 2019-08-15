/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 14:31:40
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { PhoneTabRouter } from '../PhoneTabRouter';
import { shallow } from 'enzyme';
import { PhoneTabRouterView } from '../PhoneTabRouter.View';

jest.mock('sdk/module/config/service/UserConfigService');
jest.mock('sdk/dao');
jest.mock('sdk/api');
jest.mock('@/store/utils');
jest.mock('sdk/module/config');

describe('PhoneTab', () => {
  @testable
  class init {
    @test('should create a PhoneTab instance when mount')
    t1() {
      const wrapper = shallow(<PhoneTabRouter />);
      const viewWrapper = shallow(<PhoneTabRouterView />);
      expect(wrapper).toBeTruthy();
      expect(viewWrapper).toBeTruthy();
    }
  }
});
