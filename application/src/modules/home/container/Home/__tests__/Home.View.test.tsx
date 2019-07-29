/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-29 15:48:11
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { mockContainer } from 'shield/application';
import { mockService } from 'shield/sdk';
import { HomeStore } from '@/modules/home/store';
import { AccountService } from 'sdk/module/account';
import { mountWithTheme } from 'shield/utils';
import { RuiLink } from 'rcui/components/Link';
import { shallow } from 'enzyme';
import { Notification } from '@/containers/Notification';

import { HomeView } from '../Home.View';

jest.mock('@/containers/Notification');

describe('HomeView', () => {
  @testable
  class showE911Link {
    @test('should be show confirm e911 when not confirm')
    @mockContainer(HomeStore, 'extensions')
    @mockService(AccountService, 'makeSureUserInWhitelist')
    t1() {
      const props = {
        needConfirmE911: jest.fn().mockReturnValue(true),
        openE911: jest.fn().mockReturnValue(true),
        showGlobalSearch: false,
      };
      const wrapper = shallow(<HomeView {...props} />);
      // wrapper.instance().showE911Confirm();
      // console.log(wrapper.debug());
      // expect(Notification.flagToast).toHaveBeenCalled();
    }
  }
});
