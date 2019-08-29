/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-22 15:44:12
 * Copyright © RingCentral. All rights reserved.
 */
import {
  focusCampo,
  sleep,
  toFirstLetterUpperCase,
  getDisplayNameByCaller,
  onVoicemailNotificationClick,
} from '../helpers';
import * as utils from '@/store/utils';
import history from '@/history';
import { CALL_DIRECTION } from 'sdk/module/RCItems';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { Notification } from '@/containers/Notification';

jest.mock('@/utils/i18nT', () => ({
  i18nP: (key: string) => key,
}));

jest.mock('@/modules/common/container/PhoneNumberFormat', () => ({
  formatPhoneNumber: (number: string) => number,
}));

describe('helpers', () => {
  describe('focusCampo', () => {
    it('should not blur', () => {
      const mockedInput = {
        selectionDirection: 'backward',
        selectionStart: 0,
        blur: jest.fn(),
        focus: jest.fn(),
        value: '',
      };
      focusCampo(mockedInput);
      expect(mockedInput.blur).toHaveBeenCalled();
    });

    it('should do noting when recieve undefined', () => {
      const cache = window.HTMLInputElement.prototype.focus;
      window.HTMLInputElement.prototype.focus = jest.fn();
      focusCampo(undefined);
      expect(window.HTMLInputElement.prototype.focus).not.toHaveBeenCalled();
      window.HTMLInputElement.prototype.focus = cache;
    });
  });

  describe('sleep', () => {
    it('should wait 20ms asyncally', async () => {
      const startTime = +new Date();
      const { promise } = sleep(20);
      await promise;
      const endTime = +new Date();
      expect(endTime - startTime >= 20).toBeTruthy();
    });
  });

  describe('toFirstLetterUpperCase', () => {
    it('should turning the first letter to upper case', () => {
      const val = 'test';
      expect(toFirstLetterUpperCase(val)).toEqual('Test');
    });
  });

  describe('getDisplayNameByCaller', () => {
    it('should be display person entity name [JPT-2534]', async () => {
      jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
        matchContactByPhoneNumber: jest.fn().mockResolvedValue({
          id: 1,
        }),
      });
      jest
        .spyOn(utils, 'getEntity')
        .mockImplementation(() => ({ userDisplayName: 'xxx' }));
      const activeCall = {
        from: '123',
        to: '456',
        toName: 'abc',
        fromName: 'def',
        direction: CALL_DIRECTION.OUTBOUND,
      };
      const displayName = await getDisplayNameByCaller(activeCall);
      expect(displayName).toBe('xxx');
    });

    it('should be display caller name [JPT-2534]', async () => {
      jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
        matchContactByPhoneNumber: jest.fn().mockResolvedValue(null),
      });
      const activeCall = {
        from: '123',
        to: '456',
        toName: 'abc',
        fromName: 'def',
        direction: CALL_DIRECTION.OUTBOUND,
      };
      const displayName = await getDisplayNameByCaller(activeCall);
      expect(displayName).toBe('abc');
    });

    it('should be display unknown caller [JPT-2534]', async () => {
      jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
        matchContactByPhoneNumber: jest.fn().mockResolvedValue(null),
      });
      const activeCall = {
        from: '123',
        to: '456',
        toName: 'Anonymous',
        fromName: 'def',
        direction: CALL_DIRECTION.OUTBOUND,
      };
      const displayName = await getDisplayNameByCaller(activeCall);
      expect(displayName).toBe('telephony.switchCall.unknownCaller');
    });

    it('should be display phoneNumber [JPT-2534]', async () => {
      jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
        matchContactByPhoneNumber: jest.fn().mockResolvedValue(null),
      });
      const activeCall = {
        from: '123',
        to: '456',
        direction: CALL_DIRECTION.OUTBOUND,
      };
      const displayName = await getDisplayNameByCaller(activeCall);
      expect(displayName).toBe('456');
    });
  });

  describe('onVoicemailNotificationClick', () => {
    it('Should open voicemail page when user not in voicemail page [JPT-2823]', () => {
      history.location = { pathname: '/message' };
      history.push = jest.fn();

      onVoicemailNotificationClick();

      expect(history.push).toHaveBeenCalled();
    });

    it('Should flash toast when the voicemail has been deleted [JPT-2824]', () => {
      jest.spyOn(Notification, 'flashToast');
      jest.spyOn(utils, 'getEntity').mockImplementation(() => null);

      onVoicemailNotificationClick();

      expect(Notification.flashToast).toHaveBeenCalled();
    });
  });
});
