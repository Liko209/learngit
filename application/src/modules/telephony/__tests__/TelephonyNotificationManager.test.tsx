/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-04-02 15:41:55
 * Copyright © RingCentral. All rights reserved.
 */
import { Jupiter, container } from 'framework';
import { TelephonyNotificationManager } from '../TelephonyNotificationManager';
import * as i18nT from '@/utils/i18nT';
import * as telephony from '@/modules/telephony/module.config';
import * as notification from '@/modules/notification/module.config';
import { TelephonyStore } from '../store';
const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);
jupiter.registerModule(notification.config);

describe('TelephonyNotificationManager', () => {
  describe('dispatch()', () => {
    const telephonyNotificationManager = jupiter.get(
      TelephonyNotificationManager,
    );
    const telephonyStore = jupiter.get(TelephonyStore);
    const title = 'Incoming Call';
    jest.spyOn(i18nT, 'default').mockImplementation(async i => {
      const translation = {
        'telephony.notification.incomingCall': 'Incoming Call',
        'telephony.notification.answer': 'Answer',
        'telephony.notification.unknownCaller': 'Unknown Caller',
      };
      return translation[i] || i;
    });

    beforeEach(() => {
      jest.clearAllMocks();
      Object.assign(telephonyStore, {
        callState: 0,
        callId: '1',
        phoneNumber: '123',
        callerName: 'alex',
      });
    });

    it('should call show() when dispatch action is SHOW', async () => {
      jest.spyOn(telephonyNotificationManager, 'show').mockImplementation();
      await telephonyNotificationManager.dispatch('SHOW');

      expect(telephonyNotificationManager.show).toHaveBeenCalledWith(
        title,
        expect.objectContaining({
          tag: '1',
          data: {
            id: '1',
            scope: 'telephony',
          },
          body: 'alex 123',
          icon: '/icon/incomingCall.png',
        }),
      );
    });

    it('should call show() with body contains "Unknown Caller" when the call is from an unrecognized caller [JPT-1489]', async () => {
      jest.spyOn(telephonyNotificationManager, 'show').mockImplementation();
      telephonyStore.callerName = '';
      await telephonyNotificationManager.dispatch('SHOW');

      expect(telephonyNotificationManager.show).toHaveBeenCalledWith(
        title,
        expect.objectContaining({
          tag: '1',
          data: {
            id: '1',
            scope: 'telephony',
          },
          body: 'Unknown Caller 123',
          icon: '/icon/incomingCall.png',
        }),
      );
    });

    it('should call show() with body contains "Unknown Caller" when the caller is anonymous [JPT-1489]', async () => {
      jest.spyOn(telephonyNotificationManager, 'show').mockImplementation();
      telephonyStore.phoneNumber = 'anonymous';
      await telephonyNotificationManager.dispatch('SHOW');

      expect(telephonyNotificationManager.show).toHaveBeenCalledWith(
        title,
        expect.objectContaining({
          tag: '1',
          data: {
            id: '1',
            scope: 'telephony',
          },
          body: 'Unknown Caller ',
          icon: '/icon/incomingCall.png',
        }),
      );
    });
    it('should call close() when dispatch action is CLOSE', () => {
      jest.spyOn(telephonyNotificationManager, 'close').mockImplementation();
      telephonyNotificationManager.dispatch('CLOSE');
      expect(telephonyNotificationManager.close).toHaveBeenCalledWith('1');
    });

    it('should call clear() when dispatch action is DISPOSE', () => {
      jest.spyOn(telephonyNotificationManager, 'clear').mockImplementation();
      telephonyNotificationManager.dispatch('DISPOSE');
      expect(telephonyNotificationManager.clear).toHaveBeenCalled();
    });
  });
});
