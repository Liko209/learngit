/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-04-02 15:41:55
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { TelephonyNotificationManager } from '../TelephonyNotificationManager';
import * as i18nT from '@/utils/i18nT';
import * as telephony from '@/modules/telephony/module.config';
import * as notification from '@/modules/notification/module.config';
import * as common from '@/modules/common/module.config';
import * as media from '@/modules/media/module.config';
import { NOTIFICATION_PRIORITY } from '@/modules/notification/interface';
import { TelephonyStore } from '../store';
import { getEntity } from '@/store/utils';
import { ANONYMOUS_NAME } from '../interface/constant';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { formatPhoneNumber } from '@/modules/common/container/PhoneNumberFormat';
import { ENTITY_NAME } from '@/store/constants';
import { NOTIFICATION_OPTIONS } from 'sdk/module/profile';
import { CALL_STATE, CALL_DIRECTION } from 'sdk/module/telephony/entity';
import { observable } from 'mobx';
import * as media from '@/modules/media/module.config';

jest.mock('@/modules/media/service');

jest.mock('@/store/utils');
jest.mock('sdk/module/telephony');
jest.mock('@/modules/common/container/PhoneNumberFormat');

jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
  matchContactByPhoneNumber: jest.fn().mockResolvedValue({}),
});

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);
jupiter.registerModule(notification.config);
jupiter.registerModule(media.config);

global.Notification = {
  permission: 'defalut',
};

jupiter.registerModule(common.config);

let telephonyNotificationManager: TelephonyNotificationManager;
let telephonyStore: TelephonyStore;
const title = 'Incoming Call';
let call: any;
const incomingCallDisposer = jest.fn();
const voicemailDisposer = jest.fn();

function setUpMock(incomingCallsValue: NOTIFICATION_OPTIONS) {
  call = observable({
    uuid: '1',
    callState: CALL_STATE.IDLE,
    direction: null,
    fromName: 'alex',
    fromNum: '+44(650)-234-560',
  });
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
    if (entityName === ENTITY_NAME.CALL) {
      return call;
    }
  });
  telephonyNotificationManager = jupiter.get(TelephonyNotificationManager);
  telephonyNotificationManager._disposers = [
    incomingCallDisposer,
    voicemailDisposer,
  ];
  telephonyStore = jupiter.get(TelephonyStore);
  Object.assign(telephonyStore, {
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

    formatPhoneNumber.mockImplementation(() => '(650)-234-560');
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
      call.callState = CALL_STATE.IDLE;
      call.direction = CALL_DIRECTION.INBOUND;
      Object.assign(telephonyStore, {
        isContactMatched: true,
      });
      expect(telephonyNotificationManager._showNotification).toHaveBeenCalled();
    });
    it('should not call _showNotification() when incomingCallsSettingItem value is off', () => {
      jest
        .spyOn(telephonyNotificationManager, '_showNotification')
        .mockImplementation();
      call.callState = CALL_STATE.IDLE;
      call.direction = CALL_DIRECTION.INBOUND;
      Object.assign(telephonyStore, {
        isContactMatched: true,
      });
      setUpMock(NOTIFICATION_OPTIONS.OFF);
      telephonyNotificationManager.init();
      expect(
        telephonyNotificationManager._showNotification,
      ).not.toHaveBeenCalled();
    });

    it.each`
      CALL_STATE
      ${CALL_STATE.DISCONNECTED}
      ${CALL_STATE.CONNECTING}
      ${CALL_STATE.CONNECTED}
      ${CALL_STATE.IDLE}
    `(
      'should call _closeNotification() when CALL_STATE value is $CALL_STATE',
      ({ CALL_STATE }) => {
        jest
          .spyOn(telephonyNotificationManager, '_closeNotification')
          .mockImplementation();
        telephonyNotificationManager.init();
        call.callState = CALL_STATE;
        Object.assign(telephonyStore, {
          isContactMatched: false,
        });
        expect(
          telephonyNotificationManager._closeNotification,
        ).toHaveBeenCalled();
      },
    );
    it('should call show() with body contains "belle" when the call is from a caller which has a match in contacts', async () => {
      call.direction = CALL_DIRECTION.INBOUND;
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
      call.direction = CALL_DIRECTION.INBOUND;
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
      call.direction = CALL_DIRECTION.INBOUND;
      call.fromName = ANONYMOUS_NAME;
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
      call.direction = CALL_DIRECTION.INBOUND;
      call.fromName = '';
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
      expect(incomingCallDisposer).toHaveBeenCalled();
      expect(voicemailDisposer).toHaveBeenCalled();
    });
  });

  describe('_notifyNewVoicemail()', () => {
    it('Should show notification when notify new voicemail [JPT-2822]', () => {
      jest.spyOn(telephonyNotificationManager, 'show').mockImplementation();

      telephonyNotificationManager._notifyNewVoicemail({});

      expect(telephonyNotificationManager.show).toHaveBeenCalled();
    });
  });
});
