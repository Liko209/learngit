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
import { getEntity } from '@/store/utils';
jest.mock('@/store/utils');

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);
jupiter.registerModule(notification.config);

beforeAll(() => {
  (getEntity as jest.Mock).mockReturnValue({
    userDisplayName: 'alex',
  });
});

describe('TelephonyNotificationManager', () => {
  const telephonyNotificationManager = jupiter.get(
    TelephonyNotificationManager,
  );
  telephonyNotificationManager._disposer = jest.fn();
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
      contact: {},
    });
  });

  describe('_showNotification()', () => {
    it('should call show() when call _showNotification', async () => {
      jest.spyOn(telephonyNotificationManager, 'show').mockImplementation();
      await telephonyNotificationManager._showNotification();

      expect(telephonyNotificationManager.show).toHaveBeenCalledWith(
        title,
        expect.objectContaining({
          requireInteraction: true,
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

    it('should call show() with body contains "Unknown Caller" when the call is from an unrecognized caller which does not have a  match in contacts [JPT-1489]', async () => {
      jest.spyOn(telephonyNotificationManager, 'show').mockImplementation();
      telephonyStore.contact = null;
      await telephonyNotificationManager._showNotification();

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
  });

  describe('_closeNotification()', () => {
    it('should call close() when call _closeNotification', () => {
      jest.spyOn(telephonyNotificationManager, 'close').mockImplementation();
      telephonyNotificationManager._closeNotification();
      expect(telephonyNotificationManager.close).toHaveBeenCalledWith('1');
    });
  });

  describe('dispose()', () => {
    it('should call clear() when call dispose', () => {
      jest.spyOn(telephonyNotificationManager, 'clear').mockImplementation();
      telephonyNotificationManager.dispose();
      expect(telephonyNotificationManager.clear).toHaveBeenCalled();
      expect(telephonyNotificationManager._disposer).toHaveBeenCalledTimes(1);
    });
  });
});
