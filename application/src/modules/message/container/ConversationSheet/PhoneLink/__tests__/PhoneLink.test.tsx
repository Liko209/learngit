/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-27 14:26:50
 * Copyright © RingCentral. All rights reserved.
 */
import { testable, test } from 'shield';
import { mockService } from 'shield/sdk';
import React from 'react';
import { PhoneLink } from '../';
import * as helper from '../helper';
import { ServiceConfig } from 'sdk/module/serviceLoader';
import { registerModule } from 'shield/utils';

import { config as featureFlagConfig } from '@/modules/featuresFlags/module.config';
import { config as telephonyConfig } from '@/modules/telephony/module.config';
import { config as commonConfig } from '@/modules/common/module.config';
import { mountWithTheme } from '@/__tests__/utils';

import { PermissionService } from 'sdk/module/permission';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ProfileService } from 'sdk/module/profile';
import { container } from 'framework';
import { TelephonyService } from '@/modules/telephony/service';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import {
  mockSingleEntity,
  mockEntity,
  mockGlobalValue,
} from 'shield/application';

registerModule(commonConfig);
registerModule(featureFlagConfig);
registerModule(telephonyConfig);

window['RTCPeerConnection'] = true;

const _telephonyService: TelephonyService = container.get(TELEPHONY_SERVICE);

describe('PhoneLinkView', () => {
  const telephonyService = {
    name: ServiceConfig.TELEPHONY_SERVICE,
    makeCall() {},
    getAllCallCount() {},
    makeRCPhoneCall() {},
  };
  @testable
  class TestIsRCUserOrNot {
    @mockService(RCInfoService, 'isVoipCallingAvailable', true)
    @mockService(PermissionService, 'hasPermission', true)
    @mockService.resolve(ProfileService, 'getProfile', {})
    @mockSingleEntity({})
    beforeEach() {}

    @mockGlobalValue(true)
    @test('should render JuiConversationNumberLink when is rc user')
    t1() {
      const wrapper = mountWithTheme(
        <PhoneLink text='123-123-12-211'>123-123-12-211</PhoneLink>,
      );
      expect(wrapper.find('a').exists()).toBe(true);
    }

    @mockGlobalValue(false)
    @test('should not render JuiConversationNumberLink when is not rc user')
    t2() {
      const wrapper = mountWithTheme(
        <PhoneLink text='123-123-12-211'>123-123-12-211</PhoneLink>,
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
    beforeEach() {
      jest.spyOn(helper, 'isSupportWebRTC').mockReturnValue(true);
      jest.spyOn(_telephonyService, 'makeCall').mockResolvedValue(true);
    }

    @test('should direct call when can use telephony and user click')
    @mockService(RCInfoService, 'isVoipCallingAvailable', true)
    @mockService(PermissionService, 'hasPermission', true)
    @mockService(PermissionService, 'hasPermission', true)
    async t1() {
      let wrapper = mountWithTheme(
        <PhoneLink text='123-123-12-211'>123-123-12-211</PhoneLink>,
      );
      // needed to defer wrapper.update() till after the promise resolves
      await new Promise((resolve) => setTimeout(resolve, 0));
      wrapper.update();
      const link = wrapper.find('a[href="javascript:;"]');
      expect(link.exists()).toBe(true);
      link.simulate('click', { preventDefault: jest.fn() });
      expect(_telephonyService.makeCall).toHaveBeenCalled();
    }

    @test('should direct call when can NOT use telephony')
    @mockService(RCInfoService, 'isVoipCallingAvailable', false)
    @mockService(PermissionService, 'hasPermission', true)
    t2() {
      let wrapper = mountWithTheme(
        <PhoneLink text='123-123-12-211'>123-123-12-211</PhoneLink>,
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
