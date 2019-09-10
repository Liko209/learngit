/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-27 14:26:50
 * Copyright © RingCentral. All rights reserved.
 */
import { testable, test } from 'shield';
import { mockService } from 'shield/sdk';
import React from 'react';
import { PhoneLink } from '..';
import * as helper from '../helper';

import { mountWithTheme, asyncMountWithTheme } from 'shield/utils';
import { PermissionService } from 'sdk/module/permission';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ProfileService } from 'sdk/module/profile';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import {
  mockContainer,
  mockSingleEntity,
  mockEntity,
  mockGlobalValue,
} from 'shield/application';
import * as media from '@/modules/media/module.config';

window['RTCPeerConnection'] = true;

describe('PhoneLinkView', () => {
  const telephonyService = {
    name: TELEPHONY_SERVICE,
    directCall() {},
  };
  @testable
  class TestIsRCUserOrNot {
    @mockService(RCInfoService, 'isVoipCallingAvailable', true)
    @mockService(PermissionService, 'hasPermission', true)
    @mockService.resolve(ProfileService, 'getProfile', {})
    @mockSingleEntity({})
    @mockContainer(FeaturesFlagsService, 'canUseTelephony')
    beforeEach() {}

    @mockGlobalValue(true)
    @test('should render JuiConversationNumberLink when is rc user')
    t1() {
      const wrapper = mountWithTheme(
        <PhoneLink text="123-123-12-211">123-123-12-211</PhoneLink>,
      );
      expect(wrapper.find('a').exists()).toBe(true);
    }

    @mockGlobalValue(false)
    @test('should not render JuiConversationNumberLink when is not rc user')
    t2() {
      const wrapper = mountWithTheme(
        <PhoneLink text="123-123-12-211">123-123-12-211</PhoneLink>,
      );
      expect(wrapper.find('a').exists()).toBe(false);
      expect(wrapper.text().includes('123-123-12-211')).toBe(true);
    }
  }

  @testable
  class TestCanUseTelephonyOrNot {
    @mockSingleEntity({})
    @mockEntity({})
    @mockGlobalValue(true)
    @mockContainer(FeaturesFlagsService, 'canUseTelephony', true)
    beforeEach() {
      jest.spyOn(helper, 'isSupportWebRTC').mockReturnValue(true);
    }

    @test('should direct call when can use telephony and user click')
    @mockService(RCInfoService, 'isVoipCallingAvailable', true)
    @mockService(PermissionService, 'hasPermission', true)
    @mockService(PermissionService, 'hasPermission', true)
    @mockContainer(telephonyService, 'directCall', true)
    async t1() {
      const wrapper = await asyncMountWithTheme(
        <PhoneLink text="123-123-12-211">123-123-12-211</PhoneLink>,
      );
      await wrapper.update();
      const link = wrapper.find('a[href=""]');
      expect(link.exists()).toBe(true);
      link.simulate('click', { preventDefault: jest.fn() });
      expect(telephonyService.directCall).toHaveBeenCalled();
    }

    @test('should direct call when can NOT use telephony')
    @mockService(RCInfoService, 'isVoipCallingAvailable', false)
    @mockService(PermissionService, 'hasPermission', true)
    t2() {
      let wrapper = mountWithTheme(
        <PhoneLink text="123-123-12-211">123-123-12-211</PhoneLink>,
      );
      wrapper = wrapper.update();
      expect(
        wrapper
          .find('a[href="rcmobile://call?number=123-123-12-211"]')
          .exists(),
      ).toBe(true);
    }
  }
});
