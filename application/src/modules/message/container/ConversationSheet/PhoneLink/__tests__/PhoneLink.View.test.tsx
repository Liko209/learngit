/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-27 13:30:27
 * Copyright © RingCentral. All rights reserved.
 */
import { testable, test } from 'shield';
import React from 'react';
import { shallow } from 'enzyme';
import { PhoneLinkView } from '../PhoneLink.View';
import { JuiConversationNumberLink } from 'jui/pattern/ConversationCard';
import * as helper from '../helper';
import { JuiItemTextValue } from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';

jest.mock('../helper.ts', () => ({
  isSupportWebRTC: jest.fn().mockReturnValue(true),
  handleHrefAttribute: jest.fn(() => ''),
}));

describe('PhoneLinkView', () => {
  @testable
  class Test {
    @test('should render JuiConversationNumberLink when is rc user')
    t1() {
      const props = {
        text: '123-123-12-211',
        isRCUser: true,
        canUseTelephony: true,
        directCall: (phoneNumber: string) => {},
        updateCanUseTelephony: async () => {},
      };
      const wrapper = shallow(<PhoneLinkView {...props} />);
      expect(wrapper.find(JuiConversationNumberLink).exists()).toBe(true);
    }

    @test('should not render JuiConversationNumberLink when is not rc user')
    t2() {
      const props = {
        text: '123-123-12-211',
        isRCUser: false,
        canUseTelephony: true,
        directCall: (phoneNumber: string) => {},
        updateCanUseTelephony: async () => {},
      };
      const wrapper = shallow(<PhoneLinkView {...props} />);
      expect(wrapper.find(JuiConversationNumberLink).exists()).toBe(false);
      expect(wrapper.contains(props.text)).toBe(true);
    }

    @test('should direct call when link clicked')
    t3() {
      const props = {
        text: '123-123-12-211',
        isRCUser: true,
        canUseTelephony: true,
        directCall: jest.fn(),
        updateCanUseTelephony: async () => {},
      };
      jest.spyOn(helper, 'isSupportWebRTC').mockReturnValue(true);
      const wrapper = shallow(<PhoneLinkView {...props} />);
      const event = { preventDefault: jest.fn() };
      wrapper.find(JuiConversationNumberLink).simulate('click', event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(props.directCall).toHaveBeenCalled();
    }

    @test('should not direct call when link clicked and can not use telephony')
    t4() {
      const props = {
        text: '123-123-12-211',
        isRCUser: true,
        canUseTelephony: false,
        directCall: jest.fn(),
        updateCanUseTelephony: async () => {},
      };
      jest.spyOn(helper, 'isSupportWebRTC').mockReturnValue(true);
      const wrapper = shallow(<PhoneLinkView {...props} />);
      const event = { preventDefault: jest.fn() };
      wrapper.find(JuiConversationNumberLink).simulate('click', event);
      expect(props.directCall).not.toHaveBeenCalled();
    }

    @test('should not link if login user has no WebRTC permission. [JPT-2749]')
    t5() {
      const props = {
        text: '123-123-12-211',
        isRCUser: true,
        type: 'conference',
        canUseConference: false,
        directCall: jest.fn(),
        updateCanUseTelephony: async () => {},
      } as any;
      jest.spyOn(helper, 'isSupportWebRTC').mockReturnValue(true);

      const wrapper = shallow(<PhoneLinkView {...props} />);
      expect(wrapper.find(JuiConversationNumberLink).exists()).toBeFalsy();
      expect(wrapper.find(JuiItemTextValue).exists()).toBeTruthy();
    }

    @test('should link if login user has WebRTC permission. [JPT-2750]')
    t6() {
      const props = {
        text: '123-123-12-211',
        isRCUser: true,
        type: 'conference',
        canUseConference: true,
        directCall: jest.fn(),
        updateCanUseTelephony: async () => {},
      } as any;
      jest.spyOn(helper, 'isSupportWebRTC').mockReturnValue(true);

      const wrapper = shallow(<PhoneLinkView {...props} />);
      expect(wrapper.find(JuiConversationNumberLink).exists()).toBeTruthy();
      expect(wrapper.find(JuiItemTextValue).exists()).toBeFalsy();
    }
  }
});
