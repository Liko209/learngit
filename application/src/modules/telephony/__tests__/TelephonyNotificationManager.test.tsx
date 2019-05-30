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
import { NOTIFICATION_PRIORITY } from '@/modules/notification/interface';
import { TelephonyStore } from '../store';
import { getEntity } from '@/store/utils';
import { ANONYMOUS } from '../interface/constant';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('@/store/utils');
jest.mock('sdk/module/telephony');

jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
  matchContactByPhoneNumber: jest.fn().mockResolvedValue({}),
});

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);
jupiter.registerModule(notification.config);

global.Notification = {
  permission: 'defalut',
};

beforeAll(() => {
  (getEntity as jest.Mock).mockReturnValue({
    userDisplayName: 'belle',
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
      uid: 1,
    });
  });

  describe('_showNotification()', () => {
    it('should call show() with body contains "belle" when the call is from a caller which has a match in contacts', async () => {
      jest.spyOn(telephonyNotificationManager, 'show').mockImplementation();
      await telephonyNotificationManager._showNotification();

      expect(telephonyNotificationManager.show).toHaveBeenCalledWith(
        title,
        expect.objectContaining({
          tag: '1',
          data: {
            id: '1',
            scope: 'telephony',
            priority: NOTIFICATION_PRIORITY.INCOMING_CALL,
          },
          body: 'belle 123',
          icon: '/icon/incomingCall.png',
        }),
      );
    });

    it('should call show() with body contains "alex" when the call is from a caller which does not have a match in contacts but has a callerName', async () => {
      telephonyStore.uid = null;
      jest.spyOn(telephonyNotificationManager, 'show').mockImplementation();
      await telephonyNotificationManager._showNotification();

      expect(telephonyNotificationManager.show).toHaveBeenCalledWith(
        title,
        expect.objectContaining({
          tag: '1',
          data: {
            id: '1',
            scope: 'telephony',
            priority: NOTIFICATION_PRIORITY.INCOMING_CALL,
          },
          body: 'alex 123',
          icon: '/icon/incomingCall.png',
        }),
      );
    });

    it('should call show() with body contains "Unknown Caller" when the call is from a caller which does not have a match in contacts and number was blocked', async () => {
      telephonyStore.uid = null;
      telephonyStore.callerName = ANONYMOUS;
      jest.spyOn(telephonyNotificationManager, 'show').mockImplementation();
      await telephonyNotificationManager._showNotification();

      expect(telephonyNotificationManager.show).toHaveBeenCalledWith(
        title,
        expect.objectContaining({
          tag: '1',
          data: {
            id: '1',
            scope: 'telephony',
            priority: NOTIFICATION_PRIORITY.INCOMING_CALL,
          },
          body: 'Unknown Caller 123',
          icon: '/icon/incomingCall.png',
        }),
      );
    });
    it('should call show() with body contains "Unknown Caller" when the call is from a caller which does not have a match in contacts and name is empty', async () => {
      telephonyStore.uid = null;
      telephonyStore.callerName = '';
      jest.spyOn(telephonyNotificationManager, 'show').mockImplementation();
      await telephonyNotificationManager._showNotification();

      expect(telephonyNotificationManager.show).toHaveBeenCalledWith(
        title,
        expect.objectContaining({
          tag: '1',
          data: {
            id: '1',
            scope: 'telephony',
            priority: NOTIFICATION_PRIORITY.INCOMING_CALL,
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
