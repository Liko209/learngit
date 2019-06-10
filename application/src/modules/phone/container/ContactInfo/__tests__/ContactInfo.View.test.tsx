/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-02 16:00:01
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { shallow } from 'enzyme';
import { Avatar } from '@/containers/Avatar';
import { MiniCard } from '@/modules/message/container/MiniCard';

import { ContactInfoView } from '../ContactInfo.View';

describe('ContactInfoView', () => {
  @testable
  class _avatar {
    @test('should person avatar if not unknown caller')
    t1() {
      const props = {
        displayName: 'displayName',
        phoneNumber: 'phoneNumber',
        isUnread: true,
        personId: 1234,
      };
      const wrapper = shallow(<ContactInfoView {...props} />);
      expect(wrapper.find(Avatar).props().showDefaultAvatar).toBeFalsy();
    }

    @test('should default avatar if not unknown caller')
    t2() {
      const props = {
        isUnknownCaller: true,
        phoneNumber: 'phoneNumber',
        isUnread: true,
      };
      const wrapper = shallow(<ContactInfoView {...props} />);
      expect(wrapper.find(Avatar).props().showDefaultAvatar).toBeTruthy();
    }
  }

  @testable
  class openMiniProfile {
    @test('should show mini profile if not unknown caller [JPT-2139][JPT-2173]')
    t1() {
      jest.spyOn(MiniCard, 'show').mockImplementation();

      const props = {
        displayName: 'displayName',
        phoneNumber: 'phoneNumber',
        isUnread: true,
        personId: 1,
      };
      const wrapper = shallow(<ContactInfoView {...props} />);
      wrapper.find(Avatar).simulate('click', { stopPropagation: jest.fn() });
      expect(MiniCard.show).toHaveBeenCalled();
    }

    @test('should not show mini profile if unknown caller [JPT-2139][JPT-2173]')
    t2() {
      jest.spyOn(MiniCard, 'show').mockImplementation();

      const props = {
        displayName: 'displayName',
        phoneNumber: 'phoneNumber',
        isUnread: true,
      };
      const wrapper = shallow(<ContactInfoView {...props} />);
      wrapper.find(Avatar).simulate('click', { stopPropagation: jest.fn() });
      expect(MiniCard.show).not.toHaveBeenCalled();
    }
  }
});
