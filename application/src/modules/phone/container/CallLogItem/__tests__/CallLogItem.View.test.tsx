/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-13 09:47:42
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { shallow } from 'enzyme';
import { READ_STATUS } from 'sdk/module/RCItems/constants';

import { CallLogItemView } from '../CallLogItem.View';
import { ContactInfo } from '../../ContactInfo';

describe('CallLogItemView', () => {
  @testable
  class readStatus {
    @test('should be unread if is missed call [JPT-2174]')
    t1() {
      const props = {
        isUnread: true,
      } as any;
      const wrapper = shallow(<CallLogItemView {...props} />);
      expect(wrapper.find(ContactInfo).props().readStatus).toBe(
        READ_STATUS.UNREAD,
      );
    }

    @test('should be read if not missed call [JPT-2174]')
    t2() {
      const props = {
        isUnread: false,
      } as any;
      const wrapper = shallow(<CallLogItemView {...props} />);
      expect(wrapper.find(ContactInfo).props().readStatus).toBe(
        READ_STATUS.READ,
      );
    }
  }
});
