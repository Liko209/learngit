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
import * as common from '@/modules/common/module.config';

import { NOTIFICATION_PRIORITY } from '@/modules/notification/interface';
import { TelephonyStore } from '../store';
import { getEntity } from '@/store/utils';
import { ANONYMOUS } from '../interface/constant';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { formatPhoneNumber } from '@/modules/common/container/PhoneNumberFormat';
import { ENTITY_NAME } from '@/store/constants';
import { NOTIFICATION_OPTIONS } from 'sdk/module/profile';
import { CALL_STATE } from '../FSM';

jest.mock('@/store/utils');
jest.mock('sdk/module/telephony');
jest.mock('@/modules/common/container/PhoneNumberFormat');

jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
  matchContactByPhoneNumber: jest.fn().mockResolvedValue({}),
});

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);
jupiter.registerModule(notification.config);

global.Notification = {
  permission: 'defalut',
};

jupiter.registerModule(common.config);

let telephonyNotificationManager: TelephonyNotificationManager;
let telephonyStore: TelephonyStore;
const title = 'Incoming Call';
function setUpMock(incomingCallsValue: NOTIFICATION_OPTIONS) {
  (getEntity as jest.Mock).mockImplementation(entityName => {
    if (entityName === ENTITY_NAME.USER_SETTING) {
      return {
        value: incomingCallsValue,
      };
    }
    if (entityName === ENTITY_NAME.PERSON) {
      return {
        userDisplayName: 'belle',
      };
    }
  });
  telephonyNotificationManager = jupiter.get(TelephonyNotificationManager);
  telephonyNotificationManager._disposer = jest.fn();
  telephonyStore = jupiter.get(TelephonyStore);
  Object.assign(telephonyStore, {
    callState: 0,
    callId: '1',
    phoneNumber: '+44(650)-234-560',
    callerName: 'alex',
    uid: 1,
  });
}

describe('TelephonyNotificationManager', () => {
  beforeEach(() => {
    container.snapshot();
    jest.clearAllMocks();
    jest.spyOn(i18nT, 'default').mockImplementation(async i => {
      const translation = {
        'telephony.notification.incomingCall': 'Incoming Call',
        'telephony.notification.answer': 'Answer',
        'telephony.notification.unknownCaller': 'Unknown Caller',
      };
      return translation[i] || i;
    });

    formatPhoneNumber.mockImplementation(() => {
      return '(650)-234-560';
    });
  });

  afterEach(() => {
    container.restore();
  });
  describe('shouldShowNotification', () => {
    it.each`
      incomingCallsValue          | expected
      ${NOTIFICATION_OPTIONS.ON}  | ${true}
      ${NOTIFICATION_OPTIONS.OFF} | ${false}
    `(
      'shouldShowNotification should be $expected when incomingCallsSettingItem value is $incomingCallsValue',
      ({ incomingCallsValue, expected }) => {
        setUpMock(incomingCallsValue);
        expect(telephonyNotificationManager.shouldShowNotification).toBe(
          expected,
        );
      },
    );
  });
  describe('_showNotification()', () => {
    beforeEach(() => {
      setUpMock(NOTIFICATION_OPTIONS.ON);
    });
    it('should call _showNotification() when incomingCallsSettingItem value is on', () => {
      jest
        .spyOn(telephonyNotificationManager, '_showNotification')
        .mockImplementation();
      telephonyNotificationManager.init();
      Object.assign(telephonyStore, {
        callState: CALL_STATE.INCOMING,
        isContactMatched: true,
      });
      expect(telephonyNotificationManager._showNotification).toBeCalled();
    });
    it('should not call _showNotification() when incomingCallsSettingItem value is off', () => {
      jest
        .spyOn(telephonyNotificationManager, '_showNotification')
        .mockImplementation();
      Object.assign(telephonyStore, {
        callState: CALL_STATE.INCOMING,
        isContactMatched: true,
      });
      setUpMock(NOTIFICATION_OPTIONS.OFF);
      telephonyNotificationManager.init();
      expect(telephonyNotificationManager._showNotification).not.toBeCalled();
    });
    it.each`
      CALL_STATE
      ${CALL_STATE.IDLE}
      ${CALL_STATE.DIALING}
      ${CALL_STATE.CONNECTING}
      ${CALL_STATE.CONNECTED}
    `(
      'should call _closeNotification() when CALL_STATE value is $CALL_STATE',
      ({ CALL_STATE }) => {
        jest
          .spyOn(telephonyNotificationManager, '_closeNotification')
          .mockImplementation();
        telephonyNotificationManager.init();
        Object.assign(telephonyStore, {
          callState: CALL_STATE,
          isContactMatched: true,
        });
        expect(telephonyNotificationManager._closeNotification).toBeCalled();
      },
    );
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
          body: 'belle (650)-234-560',
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
          body: 'alex (650)-234-560',
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
          body: 'Unknown Caller (650)-234-560',
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
          body: 'Unknown Caller (650)-234-560',
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
