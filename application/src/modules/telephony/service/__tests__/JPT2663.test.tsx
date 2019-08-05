/*
 * @Author: isaac.liu
 * @Date: 2019-07-30 14:06:13
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { mockService } from 'shield/sdk';
import { mockGlobalValue } from 'shield/application';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { asyncMountWithTheme, delay } from 'shield/utils';
import { PhoneLink } from '@/modules/message/container/ConversationSheet/PhoneLink';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { PermissionService } from 'sdk/module/permission';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ProfileService } from 'sdk/module/profile';
import { TelephonyService } from '../TelephonyService';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { container, Jupiter, injectable, decorate } from 'framework';
import { config } from '@/modules/telephony/module.config';
import { TelephonyService as ServerTelephonyService } from 'sdk/module/telephony';


jest.mock('@/containers/Notification');

decorate(injectable(), FeaturesFlagsService);

describe('Prompt user to confirm emergency address first when user tries to make outbound call to non-ext number', () => {
  let telephonyService: TelephonyService;

  beforeAll(() => {
    window['RTCPeerConnection'] = true;

    container.bind(FeaturesFlagsService).to(FeaturesFlagsService);
  });

  @testable
  class t1 {
    @mockService(FeaturesFlagsService, 'canUseTelephony', true)
    @mockService(ServerTelephonyService, [
      { method: 'getAllCallCount', data: 0 },
      { method: 'isEmergencyAddrConfirmed', data: false },
    ])
    @mockService(RCInfoService, [
      { method: 'isVoipCallingAvailable', data: true },
      { method: 'getDigitalLines', data: [1] },
    ])
    @mockService(PermissionService, 'hasPermission', true)
    @mockService.resolve(ProfileService, 'getProfile', {})
    @mockGlobalValue(true)
    beforeEach() {
      const jupiter = container.get(Jupiter);
      jupiter.registerModule(config);
      telephonyService = container.get(TELEPHONY_SERVICE);
    }

    @test('should prompt when Clicks a phone number in the conversation stream')
    async t2() {
      jest
        .spyOn(telephonyService, 'isShortNumber')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(telephonyService, 'openE911')
        .mockImplementationOnce(jest.fn());
      const phoneNumber = '4809461693';

      const wrapper = await asyncMountWithTheme(
        <PhoneLink text={phoneNumber}>{phoneNumber}</PhoneLink>,
      );
      await wrapper.update();
      const link = wrapper.find('a');
      link.simulate('click', { preventDefault: jest.fn() });
      await delay();
      expect(telephonyService.openE911).toHaveBeenCalled();
      wrapper.unmount();
    }

    @test(
      'should not prompt when Clicks a short phone number in the conversation stream',
    )
    async t3() {
      jest.spyOn(telephonyService, 'isShortNumber').mockResolvedValueOnce(true);
      jest
        .spyOn(telephonyService, '_makeCall')
        .mockImplementationOnce(jest.fn());
      jest
        .spyOn(telephonyService, 'openE911')
        .mockImplementationOnce(jest.fn());
      const phoneNumber = '480';

      const wrapper = await asyncMountWithTheme(
        <PhoneLink text={phoneNumber}>{phoneNumber}</PhoneLink>,
      );
      await wrapper.update();
      const link = wrapper.find('a');
      link.simulate('click', { preventDefault: jest.fn() });
      await delay();
      expect(telephonyService.openE911).not.toHaveBeenCalled();
      wrapper.unmount();
    }
  }

  @testable
  class t2 {
    @mockService(FeaturesFlagsService, 'canUseTelephony', true)
    @mockService(ServerTelephonyService, [
      { method: 'getAllCallCount', data: 0 },
      { method: 'isEmergencyAddrConfirmed', data: false },
    ])
    @mockService(RCInfoService, [
      { method: 'isVoipCallingAvailable', data: true },
      { method: 'getDigitalLines', data: [] },
    ])
    @mockService(PermissionService, 'hasPermission', true)
    @mockService.resolve(ProfileService, 'getProfile', {})
    @mockGlobalValue(true)
    beforeEach() {
      const jupiter = container.get(Jupiter);
      jupiter.registerModule(config);
      telephonyService = container.get(TELEPHONY_SERVICE);
    }

    @test('should show flash toast when not digital line')
    async t1() {
      Notification.flashToast = jest.fn();
      jest
        .spyOn(telephonyService, 'isShortNumber')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(telephonyService, '_makeCall')
        .mockImplementationOnce(jest.fn());
      const phoneNumber = '480';

      const wrapper = await asyncMountWithTheme(
        <PhoneLink text={phoneNumber}>{phoneNumber}</PhoneLink>,
      );
      await wrapper.update();
      const link = wrapper.find('a');
      link.simulate('click', { preventDefault: jest.fn() });
      await delay();
      expect(Notification.flashToast).toHaveBeenCalledWith({
        message: 'telephony.prompt.e911ExtensionNotAllowedToMakeCall',
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.CENTER,
        fullWidth: false,
        autoHideDuration: 5000,
        dismissible: true,
      });
      wrapper.unmount();
    }
  }
});
