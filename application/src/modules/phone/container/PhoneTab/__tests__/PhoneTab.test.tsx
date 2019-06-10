/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 14:31:40
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { registerModule } from 'shield/utils';
import { PhoneTabRouter } from '../PhoneTabRouter';
import { mount } from 'shield/utils';
import { test, testable } from 'shield';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';
import { config } from '@/modules/phone/module.config';
import { config as telephonyConfig } from '@/modules/telephony/module.config';
import { config as common } from '@/modules/common/module.config';
import * as featuresFlags from '@/modules/featuresFlags/module.config';

jest.mock('sdk/module/config/service/UserConfigService');
jest.mock('sdk/dao');
jest.mock('sdk/api');
jest.mock('@/store/utils');

registerModule(config);
registerModule(telephonyConfig);
registerModule(featuresFlags);
registerModule(common);

describe('PhoneTab', () => {
  const history = createMemoryHistory();

  @testable
  class init {
    @test('should create a PhoneTab instance when mount')
    t1() {
      const wrapper = mount(
        <Router history={history}>
          <PhoneTabRouter />
        </Router>,
      );
      expect(wrapper).toBeTruthy();
    }
  }
});
