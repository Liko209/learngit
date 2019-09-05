/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-02 17:28:54
 * Copyright © RingCentral. All rights reserved.
 */

import { TelephonyService } from '../TelephonyService';
import * as utils from '@/store/utils';
import { CLIENT_SERVICE } from '@/modules/common/interface';
import { v4 } from 'uuid';
import {
  TelephonyService as ServerTelephonyService,
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
} from 'sdk/module/telephony';
import { VoicemailService } from 'sdk/module/RCItems/voicemail';
import { CallLogService } from 'sdk/module/RCItems/callLog';
import { RCInfoService } from 'sdk/module/rcInfo';
import { MAKE_CALL_ERROR_CODE } from 'sdk/module/telephony/types';
import { PersonService } from 'sdk/module/person';
import { ToastCallError } from '../ToastCallError';
import { PhoneNumberService } from 'sdk/module/phoneNumber';
import { container } from 'framework/ioc';
import { jupiter } from 'framework/Jupiter';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { ClientService } from '@/modules/common';
import { CALLING_OPTIONS } from 'sdk/module/profile';
import { getEntity } from '@/store/utils';
import {
  HOLD_STATE,
  RECORD_STATE,
  MUTE_STATE,
  CALL_DIRECTION,
  CALL_STATE,
} from 'sdk/module/telephony/entity';
import { observable } from 'mobx';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';

import { ERCServiceFeaturePermission } from 'sdk/module/rcInfo/types';

import { SettingService } from '@/modules/setting/service/SettingService';
import { Dialog } from '@/containers/Dialog';
import { Notification } from '@/modules/message/container/ConversationPost/Notification';

import { MediaService } from '@/modules/media/service';

import { config } from '../../module.config';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { isCurrentUserDND } from '@/modules/notification/utils';
import { TRANSFER_TYPE } from 'sdk/module/telephony/types';

jest.mock('@/modules/notification/utils');
jest.mock('@/store/utils');
jest.mock('@/store/base/fetch/FetchSortableDataListHandler');

const mockedDelay = 10;
const testProcedureWaitingTime = 100;

// HACK: flag for changing the call action result dynamically
let count = 0;
let telephonyService: TelephonyService;
let call: any;

jest.mock('../ToastCallError');
jest.mock('@/containers/Notification');

const sleep = (time: number): Promise<void> =>
  new Promise<void>((res, rej) => {
    setTimeout(res, time);
  });

let mockedServerTelephonyService: any;
let mockedPhoneNumberService: any;
let mockedRCInfoService: any;
let mockedSettingService: any;
let mockedAccountService: any;
let mockedVoicemailService: any;
let mockedMissedCallService: any;

function initializeCallerId() {
  try {
    telephonyService._telephonyStore.chosenCallerPhoneNumber = '123';
    telephonyService._telephonyStore.callerPhoneNumberList = [
      { id: '123', phoneNumber: '123', usageType: 'companyNumber' },
    ];
  } catch (e) {}
}
let defaultPhoneApp = CALLING_OPTIONS.GLIP;
describe('TelephonyService', () => {
  beforeEach(() => {
    // mock media element methods
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'load');
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'play');
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'pause');
    jest.spyOn<HTMLMediaElement, any>(
      HTMLMediaElement.prototype,
      'addTextTrack',
    );
    jest
      .spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'canPlayType')
      .mockReturnValue('maybe');

    jest.spyOn(utils, 'getSingleEntity').mockImplementation();
    let cachedOnMadeOutgoingCall: any;

    call = observable({
      id: '1',
      // callEntityId: '1',
      holdState: HOLD_STATE.IDLE,
      recordState: RECORD_STATE.IDLE,
      muteState: MUTE_STATE.IDLE,
      direction: CALL_DIRECTION.INBOUND,
    });

    (getEntity as jest.Mock).mockReturnValue(call);

    mockedRCInfoService = {
      get: jest.fn(),
      getCallerIdList: jest.fn(),
      getForwardingNumberList: jest.fn(),
      isRCFeaturePermissionEnabled: jest.fn(),
      isVoipCallingAvailable: jest.fn().mockReturnValue(true),
      hasSetCallerId: jest.fn(),
      getDigitalLines: jest.fn(),
      getAccountMainNumber: jest.fn().mockResolvedValue('1'),
    };

    jest.spyOn(utils, 'getSingleEntity').mockReturnValue(defaultPhoneApp);
    mockedPhoneNumberService = {
      isValidNumber: jest.fn().mockImplementation(toNumber => ({
        isValid: true,
        toNumber,
        parsed: toNumber,
      })),
      getLocalCanonical: jest.fn().mockImplementation(i => i),
      isShortNumber: jest.fn().mockResolvedValue(true),
    };
    mockedSettingService = {
      getById: jest.fn().mockResolvedValue({ value: CALLING_OPTIONS.GLIP }),
    };

    mockedAccountService = { userConfig: { getGlipUserId: jest.fn() } };

    jest
      .spyOn(mockedSettingService, 'getById')
      .mockResolvedValue({ value: defaultPhoneApp });

    mockedServerTelephonyService = {
      hold: jest.fn().mockImplementation(() =>
        sleep(mockedDelay).then(() =>
          count === 3 // for test failure situation
            ? Promise.reject(RTC_CALL_ACTION.HOLD)
            : Promise.resolve(RTC_CALL_ACTION.HOLD),
        ),
      ),
      unhold: jest.fn().mockImplementation(() =>
        sleep(mockedDelay).then(() =>
          count === 4 // for test failure situation
            ? Promise.reject(RTC_CALL_ACTION.UNHOLD)
            : Promise.resolve(RTC_CALL_ACTION.UNHOLD),
        ),
      ),
      startRecord: jest.fn().mockImplementation(() =>
        sleep(mockedDelay).then(() =>
          count === 3 // for test failure situation
            ? Promise.reject(RTC_CALL_ACTION.START_RECORD)
            : Promise.resolve(RTC_CALL_ACTION.START_RECORD),
        ),
      ),
      stopRecord: jest.fn().mockImplementation(() =>
        sleep(mockedDelay).then(() =>
          count === 3 // for test failure situation
            ? Promise.reject(RTC_CALL_ACTION.STOP_RECORD)
            : Promise.resolve(RTC_CALL_ACTION.STOP_RECORD),
        ),
      ),
      makeCall: jest.fn().mockImplementation(() => {
        // callEntityId = v4();
        cachedOnMadeOutgoingCall(1);
        setTimeout(() => {}, mockedDelay);
        return MAKE_CALL_ERROR_CODE.NO_ERROR;
      }),
      switchCall: jest.fn().mockImplementation(() => {
        // callEntityId = v4();
        cachedOnMadeOutgoingCall(1);
        setTimeout(() => {}, mockedDelay);
        return MAKE_CALL_ERROR_CODE.NO_ERROR;
      }),
      transfer: jest.fn(),
      hangUp: jest.fn().mockImplementation(() => {}),
      park: (callUuid: string) => {
        if (callUuid === 'failed') {
          return new Promise((resolve, reject) => {
            reject();
          });
        }
        return new Promise((resolve, reject) => {
          const callOptions: RTCCallActionSuccessOptions = {
            parkExtension: '987',
          };
          resolve(callOptions);
        });
      },
      setTelephonyDelegate: (accountDelegate: {
        onMadeOutgoingCall: () => void;
      }) => {
        const { onMadeOutgoingCall } = accountDelegate;
        cachedOnMadeOutgoingCall = onMadeOutgoingCall;
      },
      answer: jest.fn(),
      sendToVoiceMail: jest.fn(),
      ignore: jest.fn(),
      getAllCallCount: jest.fn(),
      mute: jest.fn(),
      unmute: jest.fn(),
      dtmf: jest.fn(),
      startReply: jest.fn(),
      replyWithMessage: jest.fn(),
      replyWithPattern: jest.fn(),
      forward: jest.fn(),
      flip: jest.fn(),
      userConfig: { getLastCalledNumber: jest.fn() },
      isShortNumber: jest.fn().mockReturnValue(true),
      isEmergencyAddrConfirmed: jest.fn(),
      hasActiveDL: jest.fn().mockReturnValue(true),
    };

    mockedVoicemailService = { removeEntityNotificationObserver: jest.fn() };

    mockedMissedCallService = { removeEntityNotificationObserver: jest.fn() };

    jest.spyOn(ServiceLoader, 'getInstance').mockImplementation(conf => {
      switch (conf) {
        case ServiceConfig.TELEPHONY_SERVICE:
          // telephonyService = mockedServerTelephonyService;
          return mockedServerTelephonyService as ServerTelephonyService;
        case ServiceConfig.PERSON_SERVICE:
          return {
            getSynchronously: jest.fn(),
            matchContactByPhoneNumber: jest.fn(),
          };
        case ServiceConfig.GLOBAL_CONFIG_SERVICE:
          return { get: jest.fn() };
        case ServiceConfig.USER_CONFIG_SERVICE:
          return { get: jest.fn() };
        case ServiceConfig.RC_INFO_SERVICE:
          return mockedRCInfoService as RCInfoService;
        case ServiceConfig.ACCOUNT_SERVICE:
          return mockedAccountService;
        case ServiceConfig.PHONE_NUMBER_SERVICE:
          return mockedPhoneNumberService as PhoneNumberService;
        case ServiceConfig.SETTING_SERVICE:
          return mockedSettingService as SettingService;
        case ServiceConfig.VOICEMAIL_SERVICE:
          return mockedVoicemailService as VoicemailService;
        case ServiceConfig.CALL_LOG_SERVICE:
          return mockedMissedCallService as CallLogService;
        default:
          return {} as PersonService;
      }
    });
    jupiter.registerModule(config);
    jupiter.registerService('IMediaService', MediaService);
    jupiter.registerService(CLIENT_SERVICE, ClientService);
    telephonyService = container.get(TELEPHONY_SERVICE);
    try {
      (telephonyService as TelephonyService).init();
    } catch (e) {}
    initializeCallerId();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    container.unbindAll();
    count += 1;
    mockedServerTelephonyService.isValidNumber = jest
      .fn()
      .mockReturnValue(true);
  });

  describe('The "hold" button status tests', () => {
    it('The "hold" button should be disabled when an outbound call is not connected [JPT-1545]', async () => {
      const callEntityId = v4();
      await (telephonyService as TelephonyService).directCall(callEntityId);
      telephonyService._callEntityId = callEntityId;

      call.holdState = HOLD_STATE.DISABLED;

      // expect(telephonyService).toBe(undefined);
      (telephonyService as TelephonyService).holdOrUnhold();
      expect(
        (telephonyService as TelephonyService)._telephonyStore.holdDisabled,
      ).toBe(true);
      expect(mockedServerTelephonyService.hold).not.toHaveBeenCalled();

      await (telephonyService as TelephonyService).hangUp();
      expect(
        (telephonyService as TelephonyService)._telephonyStore.holdDisabled,
      ).toBe(true);
    });

    it('User should be able to hold a call [JPT-1541]', async () => {
      const callEntityId = v4();
      await (telephonyService as TelephonyService).directCall(callEntityId);
      telephonyService._callEntityId = callEntityId;

      await sleep(testProcedureWaitingTime);
      call.holdState = HOLD_STATE.IDLE;
      await (telephonyService as TelephonyService).holdOrUnhold();
      call.holdState = HOLD_STATE.HELD;
      await (telephonyService as TelephonyService).holdOrUnhold();

      await sleep(testProcedureWaitingTime);
      call.holdState = HOLD_STATE.HELD;
      expect(
        (telephonyService as TelephonyService)._telephonyStore.holdDisabled,
      ).toBe(false);
      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(
        true,
      );
      expect(mockedServerTelephonyService.hold).toHaveBeenCalledTimes(1);

      await (telephonyService as TelephonyService).hangUp();
      call.holdState = HOLD_STATE.DISABLED;
      expect(
        (telephonyService as TelephonyService)._telephonyStore.holdDisabled,
      ).toBe(true);
    });

    it('User should be able to unhold a call [JPT-1544]', async () => {
      const callEntityId = v4();
      await (telephonyService as TelephonyService).directCall(callEntityId);
      telephonyService._callEntityId = callEntityId;
      await sleep(testProcedureWaitingTime);
      call.holdState = HOLD_STATE.IDLE;
      await (telephonyService as TelephonyService).holdOrUnhold();
      await sleep(testProcedureWaitingTime);
      call.holdState = HOLD_STATE.HELD;
      await (telephonyService as TelephonyService).holdOrUnhold();
      call.holdState = HOLD_STATE.IDLE;
      await (telephonyService as TelephonyService).holdOrUnhold();
      call.holdState = HOLD_STATE.HELD;

      expect(mockedServerTelephonyService.unhold).toHaveBeenCalledTimes(1);
      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(
        true,
      );

      await sleep(testProcedureWaitingTime);
      call.holdState = HOLD_STATE.IDLE;
      expect(
        (telephonyService as TelephonyService)._telephonyStore.holdDisabled,
      ).toBe(false);
      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(
        false,
      );

      await (telephonyService as TelephonyService).hangUp();
      call.holdState = HOLD_STATE.DISABLED;
      expect(
        (telephonyService as TelephonyService)._telephonyStore.holdDisabled,
      ).toBe(true);
    });

    it('Hold button should be changed once with unexpected error [JPT-1574]', async () => {
      const callEntityId = v4();
      await (telephonyService as TelephonyService).directCall(callEntityId);
      telephonyService._callEntityId = callEntityId;

      await sleep(testProcedureWaitingTime);
      call.holdState = HOLD_STATE.IDLE;
      await (telephonyService as TelephonyService).holdOrUnhold();
      call.holdState = HOLD_STATE.HELD;
      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(
        true,
      );

      await sleep(testProcedureWaitingTime);
      call.holdState = HOLD_STATE.IDLE;
      expect(ToastCallError.toastFailedToHold).toHaveBeenCalled();
      expect(ToastCallError.toastFailedToResume).not.toHaveBeenCalled();
      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(
        false,
      );

      await (telephonyService as TelephonyService).hangUp();
      call.holdState = HOLD_STATE.DISABLED;
      expect(
        (telephonyService as TelephonyService)._telephonyStore.holdDisabled,
      ).toBe(true);
    });

    it('Unhold button should not be changed once with unexpected error', async () => {
      const callEntityId = v4();
      await (telephonyService as TelephonyService).directCall(callEntityId);
      telephonyService._callEntityId = callEntityId;

      await sleep(testProcedureWaitingTime);
      call.holdState = HOLD_STATE.HELD;

      await (telephonyService as TelephonyService).holdOrUnhold();
      await sleep(testProcedureWaitingTime);
      call.holdState = HOLD_STATE.HELD;

      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(
        true,
      );

      await (telephonyService as TelephonyService).holdOrUnhold();

      await sleep(testProcedureWaitingTime);
      expect(ToastCallError.toastFailedToResume).toHaveBeenCalled();
      expect(ToastCallError.toastFailedToHold).not.toHaveBeenCalled();
      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(
        true,
      );

      await (telephonyService as TelephonyService).hangUp();
      call.holdState = HOLD_STATE.DISABLED;

      expect(
        (telephonyService as TelephonyService)._telephonyStore.holdDisabled,
      ).toBe(true);
    });
  });

  describe('The "record" button status tests', () => {
    it('The "record" button should be disabled when an outbound call is not connected [JPT-1604]', async () => {
      const callEntityId = v4();
      await (telephonyService as TelephonyService).directCall(callEntityId);
      telephonyService._callEntityId = callEntityId;
      call.recordState = RECORD_STATE.DISABLED;
      await (telephonyService as TelephonyService).startOrStopRecording();

      expect(
        (telephonyService as TelephonyService)._telephonyStore.recordDisabled,
      ).toBe(true);
      expect(mockedServerTelephonyService.startRecord).not.toHaveBeenCalled();

      await (telephonyService as TelephonyService).hangUp();

      expect(
        (telephonyService as TelephonyService)._telephonyStore.recordDisabled,
      ).toBe(true);
    });

    it('Start recording if the call is connected [JPT-1600]', async () => {
      mockedRCInfoService.isRCFeaturePermissionEnabled.mockReturnValue(true);

      const callEntityId = v4();
      await (telephonyService as TelephonyService).directCall(callEntityId);
      telephonyService._callEntityId = callEntityId;

      await sleep(testProcedureWaitingTime);
      call.recordState = RECORD_STATE.IDLE;
      await (telephonyService as TelephonyService).startOrStopRecording();
      call.recordState = RECORD_STATE.RECORDING;
      await (telephonyService as TelephonyService).startOrStopRecording();
      call.recordState = RECORD_STATE.RECORDING;
      expect(
        (telephonyService as TelephonyService)._telephonyStore.recordDisabled,
      ).toBe(false);
      expect(
        (telephonyService as TelephonyService)._telephonyStore.isRecording,
      ).toBe(true);
      expect(mockedServerTelephonyService.startRecord).toHaveBeenCalledTimes(1);

      await (telephonyService as TelephonyService).hangUp();
      call.recordState = RECORD_STATE.DISABLED;
      expect(
        (telephonyService as TelephonyService)._telephonyStore.recordDisabled,
      ).toBe(true);
    });

    it('Stop recording should work when call is under recording [JPT-1603]', async () => {
      const callEntityId = v4();
      await (telephonyService as TelephonyService).directCall(callEntityId);
      telephonyService._callEntityId = callEntityId;

      await sleep(testProcedureWaitingTime);
      call.recordState = RECORD_STATE.IDLE;
      await (telephonyService as TelephonyService).startOrStopRecording();
      await sleep(testProcedureWaitingTime);
      call.recordState = RECORD_STATE.RECORDING;

      await (telephonyService as TelephonyService).startOrStopRecording();
      call.recordState = RECORD_STATE.IDLE;
      await (telephonyService as TelephonyService).startOrStopRecording();
      call.recordState = RECORD_STATE.RECORDING;

      expect(mockedServerTelephonyService.stopRecord).toHaveBeenCalledTimes(1);
      expect(
        (telephonyService as TelephonyService)._telephonyStore.isRecording,
      ).toBe(true);

      await sleep(testProcedureWaitingTime);
      call.recordState = RECORD_STATE.IDLE;

      expect(
        (telephonyService as TelephonyService)._telephonyStore.recordDisabled,
      ).toBe(false);
      expect(
        (telephonyService as TelephonyService)._telephonyStore.isRecording,
      ).toBe(false);

      await (telephonyService as TelephonyService).hangUp();
      call.recordState = RECORD_STATE.DISABLED;
      expect(
        (telephonyService as TelephonyService)._telephonyStore.recordDisabled,
      ).toBe(true);
    });

    it("Record shouldn't work when a call being holded [JPT-1608]", async () => {
      const callEntityId = v4();
      await (telephonyService as TelephonyService).directCall(callEntityId);
      telephonyService._callEntityId = callEntityId;

      await sleep(testProcedureWaitingTime);
      call.holdState = HOLD_STATE.IDLE;
      await (telephonyService as TelephonyService).holdOrUnhold();
      call.recordState = RECORD_STATE.DISABLED;
      expect(
        (telephonyService as TelephonyService)._telephonyStore.recordDisabled,
      ).toBe(true);

      await sleep(testProcedureWaitingTime);
      expect(
        (telephonyService as TelephonyService)._telephonyStore.recordDisabled,
      ).toBe(true);
      call.holdState = HOLD_STATE.HELD;
      await (telephonyService as TelephonyService).holdOrUnhold();
      await sleep(testProcedureWaitingTime);
      call.recordState = RECORD_STATE.IDLE;
      expect(
        (telephonyService as TelephonyService)._telephonyStore.recordDisabled,
      ).toBe(false);

      await (telephonyService as TelephonyService).hangUp();
    });

    it('Should restore recording state when unhold [JPT-1608]', async () => {
      const callEntityId = v4();
      await (telephonyService as TelephonyService).directCall(callEntityId);
      telephonyService._callEntityId = callEntityId;

      await sleep(testProcedureWaitingTime);
      call.recordState = RECORD_STATE.IDLE;
      await (telephonyService as TelephonyService).startOrStopRecording();
      await sleep(testProcedureWaitingTime);
      call.recordState = RECORD_STATE.RECORDING;

      expect(
        (telephonyService as TelephonyService)._telephonyStore.isRecording,
      ).toBe(true);

      call.holdState = HOLD_STATE.IDLE;
      await (telephonyService as TelephonyService).holdOrUnhold();
      await sleep(testProcedureWaitingTime);
      call.holdState = HOLD_STATE.HELD;
      await (telephonyService as TelephonyService).holdOrUnhold();
      await sleep(testProcedureWaitingTime);
      call.recordState = RECORD_STATE.RECORDING;

      expect(
        (telephonyService as TelephonyService)._telephonyStore.isRecording,
      ).toBe(true);

      await (telephonyService as TelephonyService).hangUp();
    });

    it('Should prompt toast when recording disabled in service web [JPT-2427]', async () => {
      mockedRCInfoService.isRCFeaturePermissionEnabled.mockReturnValue(false);
      const callEntityId = v4();
      await (telephonyService as TelephonyService).directCall(callEntityId);
      telephonyService._callEntityId = callEntityId;

      await sleep(testProcedureWaitingTime);
      await (telephonyService as TelephonyService).startOrStopRecording();
      expect(ToastCallError.toastOnDemandRecording).toHaveBeenCalled();
      expect(mockedServerTelephonyService.startRecord).not.toHaveBeenCalled();
      expect(
        (telephonyService as TelephonyService)._telephonyStore.isRecording,
      ).toBe(false);
    });

    it('Should prompt toast when auto recording in service web [JPT-2428]', async () => {
      mockedRCInfoService.isRCFeaturePermissionEnabled.mockReturnValue(true);
      mockedServerTelephonyService.startRecord = jest
        .fn()
        .mockImplementation(() => Promise.reject(-8));

      const callEntityId = v4();
      await (telephonyService as TelephonyService).directCall(callEntityId);
      telephonyService._callEntityId = callEntityId;

      await sleep(testProcedureWaitingTime);
      await (telephonyService as TelephonyService).startOrStopRecording();
      expect(ToastCallError.toastAutoRecording).toHaveBeenCalled();
      expect(
        (telephonyService as TelephonyService)._telephonyStore.isRecording,
      ).toBe(false);
    });
  });

  describe('TelephonyService', () => {
    it('should call answer', () => {
      const callEntityId = 'id_0';
      telephonyService.answer();
      expect(mockedServerTelephonyService.answer).not.toHaveBeenCalled();
      telephonyService._callEntityId = callEntityId;
      telephonyService.answer();
      expect(mockedServerTelephonyService.answer).toHaveBeenCalledWith(
        callEntityId,
      );
      telephonyService._callEntityId = undefined;
    });

    it('should call ignore', () => {
      const callEntityId = 'id_1';
      telephonyService.ignore();
      expect(mockedServerTelephonyService.ignore).not.toHaveBeenCalled();
      telephonyService._callEntityId = callEntityId;
      telephonyService.ignore();
      expect(mockedServerTelephonyService.ignore).toHaveBeenCalledWith(
        callEntityId,
      );
      telephonyService._callEntityId = undefined;
    });

    it('should call sendToVoiceMail', () => {
      const callEntityId = 'id_2';
      telephonyService.sendToVoiceMail();
      expect(
        mockedServerTelephonyService.sendToVoiceMail,
      ).not.toHaveBeenCalled();
      telephonyService._callEntityId = callEntityId;
      telephonyService.sendToVoiceMail();
      expect(mockedServerTelephonyService.sendToVoiceMail).toHaveBeenCalledWith(
        callEntityId,
      );
      telephonyService._callEntityId = undefined;
    });

    it('should call hangUp', () => {
      const callEntityId = 'id_3';
      telephonyService.hangUp();
      expect(mockedServerTelephonyService.hangUp).not.toHaveBeenCalled();
      telephonyService._callEntityId = callEntityId;
      telephonyService.hangUp();
      expect(mockedServerTelephonyService.hangUp).toHaveBeenCalledWith(
        callEntityId,
      );
      telephonyService._callEntityId = undefined;
    });

    it('should call directCall', async () => {
      const toNumber = '000';
      const options = {};
      telephonyService._makeCall = jest.fn();
      mockedServerTelephonyService.getAllCallCount.mockReturnValue(1);
      await telephonyService.directCall(toNumber, options);
      expect(telephonyService._makeCall).not.toHaveBeenCalled();
      mockedServerTelephonyService.getAllCallCount.mockReturnValue(0);
      await telephonyService.directCall(toNumber, options);
      expect(telephonyService._makeCall).toHaveBeenCalledWith(
        toNumber,
        options,
      );
    });

    it('should call muteOrUnmute', () => {
      const callEntityId = 'id_4';
      telephonyService.muteOrUnmute();
      expect(mockedServerTelephonyService.mute).not.toHaveBeenCalled();
      expect(mockedServerTelephonyService.unmute).not.toHaveBeenCalled();
      telephonyService._callEntityId = callEntityId;
      telephonyService.muteOrUnmute();
      expect(mockedServerTelephonyService.mute).toHaveBeenCalled();
      expect(mockedServerTelephonyService.unmute).not.toHaveBeenCalled();
      jest.resetAllMocks();
      call.muteState = MUTE_STATE.MUTED;
      telephonyService.muteOrUnmute();
      call.muteState = MUTE_STATE.IDLE;
      expect(mockedServerTelephonyService.mute).not.toHaveBeenCalled();
      expect(mockedServerTelephonyService.unmute).toHaveBeenCalled();
      telephonyService._callEntityId = undefined;
    });

    it('should maximize and minimize', () => {
      const telephonyStore = telephonyService._telephonyStore;
      telephonyService._telephonyStore = {
        closeDialer: jest.fn(),
        openDialer: jest.fn(),
        onDialerInputFocus: jest.fn(),
      };
      telephonyService.maximize();
      expect(telephonyService._telephonyStore.openDialer).toHaveBeenCalled();
      expect(
        telephonyService._telephonyStore.onDialerInputFocus,
      ).toHaveBeenCalled();
      telephonyService.minimize();
      expect(telephonyService._telephonyStore.closeDialer).toHaveBeenCalled();
      telephonyService._telephonyStore = telephonyStore;
    });

    it('should call dtmf', () => {
      const callEntityId = 'id_5';
      const dtmf = `${Math.ceil(Math.random() * 10)}`;
      telephonyService._callEntityId = callEntityId;
      telephonyService.dtmf(dtmf);
      expect(mockedServerTelephonyService.dtmf).toHaveBeenCalledWith(
        callEntityId,
        dtmf,
      );
    });

    it('should call startReply', () => {
      const callEntityId = 'id_0';
      telephonyService.startReply();
      expect(mockedServerTelephonyService.startReply).not.toHaveBeenCalled();
      telephonyService._callEntityId = callEntityId;
      telephonyService.startReply();
      expect(mockedServerTelephonyService.startReply).toHaveBeenCalledWith(
        callEntityId,
      );
      telephonyService._callEntityId = undefined;
    });

    it('should call replyWithMessage', () => {
      const callEntityId = 'id_0';
      const message = 'test';
      telephonyService.replyWithMessage(message);
      expect(
        mockedServerTelephonyService.replyWithMessage,
      ).not.toHaveBeenCalled();
      telephonyService._callEntityId = callEntityId;
      telephonyService.replyWithMessage(message);
      expect(
        mockedServerTelephonyService.replyWithMessage,
      ).toHaveBeenCalledWith(callEntityId, message);
      telephonyService._callEntityId = undefined;
    });

    it('should call replyWithPattern', () => {
      const callEntityId = 'id_0';
      const pattern = RTC_REPLY_MSG_PATTERN.IN_A_MEETING;
      const time = 5;
      const timeUnit = RTC_REPLY_MSG_TIME_UNIT.MINUTE;
      telephonyService.replyWithPattern(pattern, time, timeUnit);
      expect(
        mockedServerTelephonyService.replyWithPattern,
      ).not.toHaveBeenCalled();
      telephonyService._callEntityId = callEntityId;
      telephonyService.replyWithPattern(pattern, time, timeUnit);
      expect(
        mockedServerTelephonyService.replyWithPattern,
      ).toHaveBeenCalledWith(callEntityId, pattern, time, timeUnit);
      telephonyService._callEntityId = undefined;
    });
  });

  it('should limit string length to 30', () => {
    const original = Array(50)
      .fill(1)
      .join('');
    const fn = telephonyService.updateInputStringFactory('inputString');
    fn(original);
    expect(telephonyService._telephonyStore.inputString.length).toBe(30);
  });

  it('can not input once hit length limitation', () => {
    const original = Array(30)
      .fill(1)
      .join('');
    const updateFn = telephonyService.updateInputStringFactory('inputString');
    const concatFn = telephonyService.concatInputStringFactory('inputString');

    updateFn(original);
    concatFn('2');
    expect(telephonyService._telephonyStore.inputString).toBe(original);
  });

  it('should restore the input field after interruption of an incoming call', async () => {
    telephonyService.maximize();
    const inputString = '1234';
    telephonyService._telephonyStore.inputString = inputString;

    const incomingId = v4();
    telephonyService._onReceiveIncomingCall({
      fromName: 'test',
      fromNum: '456',
      callEntityId: incomingId,
    });
    expect(
      (telephonyService as TelephonyService)._telephonyStore.inputString,
    ).toBe(inputString);
  });

  it('should call getLastCalledNumber() on SDK', () => {
    telephonyService.lastCalledNumber;
    expect(
      mockedServerTelephonyService.userConfig.getLastCalledNumber,
    ).toHaveBeenCalled();
  });

  it('should increase the string length on the input field', () => {
    telephonyService.maximize();
    const inputString = '1234';
    telephonyService._telephonyStore.inputString = inputString;
    const concatInputString = telephonyService.concatInputStringFactory(
      'inputString',
    );
    concatInputString('5');
    expect(
      (telephonyService as TelephonyService)._telephonyStore.inputString,
    ).toBe('12345');
  });

  it('Should show the toast when initiate a call to an invalid number from matched result [JPT-254]', async () => {
    mockedPhoneNumberService.isValidNumber = jest.fn().mockReturnValue(false);
    await (telephonyService as TelephonyService).directCall(v4());
    expect(ToastCallError.toastInvalidNumber).toHaveBeenCalled();
  });

  it('should prompt the toast when park during the call recording is being saved [JPT-2179]', async () => {
    telephonyService._callEntityId = '123';
    telephonyService._telephonyStore.isStopRecording = true;
    await (telephonyService as TelephonyService).park();
    expect(ToastCallError.toastParkErrorStopRecording).toHaveBeenCalledTimes(1);
  });

  it('should prompt the toast when park run into unexpected error [JPT-2180 JPT-2163]', async () => {
    telephonyService._callEntityId = 'failed';
    await (telephonyService as TelephonyService).park();
    expect(ToastCallError.toastParkError).toHaveBeenCalledTimes(1);
  });

  it('should get forward number list from RC info service', () => {
    telephonyService.getForwardingNumberList();

    expect(mockedRCInfoService.getForwardingNumberList).toHaveBeenCalled();
  });

  it('should get forward permission from RC info service', () => {
    telephonyService.getForwardPermission();

    expect(
      mockedRCInfoService.isRCFeaturePermissionEnabled,
    ).toHaveBeenCalledWith(ERCServiceFeaturePermission.CALL_FORWARDING);
  });

  it('should call forward', () => {
    const callEntityId = 'id_0';
    const phoneNumber = '123456789';
    telephonyService.forward(phoneNumber);
    expect(mockedServerTelephonyService.forward).not.toHaveBeenCalled();
    telephonyService._callEntityId = callEntityId;
    telephonyService.forward(phoneNumber);
    expect(mockedServerTelephonyService.forward).toHaveBeenCalledWith(
      callEntityId,
      phoneNumber,
    );
    telephonyService._callEntityId = undefined;
  });

  it('should call isValidNumber', () => {
    const phoneNumber = '123';
    telephonyService.isValidNumber(phoneNumber);
    expect(mockedPhoneNumberService.isValidNumber).toHaveBeenCalled();
  });

  it('Should not call flip', () => {
    telephonyService.flip('123');
    expect(mockedServerTelephonyService.flip).not.toHaveBeenCalled();
  });

  it('Should call flip', () => {
    const callEntityId = 'id_0';
    telephonyService._callEntityId = callEntityId;
    const phoneNumber = '123456789';
    telephonyService.flip(phoneNumber);
    expect(mockedServerTelephonyService.flip).toHaveBeenCalled();
    telephonyService._callEntityId = undefined;
  });

  it("Should Can't make outbound call when call permission is disabled [JPT-2381]", async () => {
    mockedRCInfoService.isVoipCallingAvailable = jest
      .fn()
      .mockReturnValue(false);
    await (telephonyService as TelephonyService).directCall(v4());
    expect(ToastCallError.toastPermissionError).toHaveBeenCalled();
  });

  it('should GC the reactions', () => {
    telephonyService.dispose();
    expect(telephonyService._callStateDisposer).toBeFalsy();
    expect(telephonyService._incomingCallDisposer).toBeFalsy();
    expect(telephonyService._defaultCallerPhoneNumberDisposer).toBeFalsy();
    expect(telephonyService._isExtDisposer).toBeFalsy();
    expect(telephonyService._callStateDisposer).toBeFalsy();
    expect(telephonyService._ringerDisposer).toBeFalsy();
    expect(telephonyService._speakerDisposer).toBeFalsy();
    expect(
      telephonyService._voicemailService.removeEntityNotificationObserver,
    ).toHaveBeenCalled();
  });

  describe('onReceiveIncomingCall()', () => {
    const params = {
      fromName: 'test',
      fromNum: '456',
      callEntityId: v4(),
    };
    beforeEach(() => {
      jest.clearAllMocks();
      defaultPhoneApp = CALLING_OPTIONS.GLIP;
      isCurrentUserDND = jest.fn().mockReturnValue(false);
      jest
        .spyOn(telephonyService._telephonyStore, 'incomingCall')
        .mockImplementation();
    });
    it("should not response when there's incoming call and default phone setting is RC phone", async () => {
      defaultPhoneApp = CALLING_OPTIONS.RINGCENTRAL;
      mockedSettingService.getById = jest
        .fn()
        .mockResolvedValue({ value: defaultPhoneApp });
      await telephonyService._onReceiveIncomingCall(params);
      expect(
        telephonyService._telephonyStore.incomingCall,
      ).not.toHaveBeenCalled();
    });
    it("should not response when there's incoming call and current presence is DND", async () => {
      defaultPhoneApp = CALLING_OPTIONS.GLIP;
      isCurrentUserDND = jest.fn().mockReturnValue(true);
      mockedSettingService.getById = jest
        .fn()
        .mockResolvedValue({ value: defaultPhoneApp });
      await telephonyService._onReceiveIncomingCall(params);
      expect(
        telephonyService._telephonyStore.incomingCall,
      ).not.toHaveBeenCalled();
    });
    it("should show ui when there's incoming call and default phone setting is Ringcentral App", async () => {
      jest
        .spyOn(mockedSettingService, 'getById')
        .mockResolvedValue({ value: 'glip' });
      await telephonyService._onReceiveIncomingCall(params);
      expect(telephonyService._telephonyStore.incomingCall).toHaveBeenCalled();
    });
    it('should set incoming call in global store if has incoming call [JPT-2222]', async () => {
      jest
        .spyOn(mockedSettingService, 'getById')
        .mockResolvedValue({ value: 'glip' });
      await telephonyService._onReceiveIncomingCall(params);
      expect(
        storeManager.getGlobalStore().get(GLOBAL_KEYS.INCOMING_CALL),
      ).toBeTruthy();
    });
  });

  describe('setCallerPhoneNumber', () => {
    it('should set to default caller id when has no input', () => {
      const defaultCallerPhoneNumber = '123';
      telephonyService._telephonyStore.defaultCallerPhoneNumber = defaultCallerPhoneNumber;
      telephonyService.setCallerPhoneNumber();
      expect(telephonyService._telephonyStore.chosenCallerPhoneNumber).toEqual(
        defaultCallerPhoneNumber,
      );
    });
  });

  describe('playBeep', () => {
    it('should not cann `HTMLMediaElement.prototype.play` when receive index not within the audio list', async () => {
      for (let i = 58; i < 123; i++) {
        await telephonyService.playBeep(String.fromCharCode(i));
        await sleep(16);
        expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
      }
    });
    it('should call `HTMLMediaElement.prototype.play` when receive index within the audio list', async () => {
      const keys = [
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '*',
        '#',
        '+',
      ];
      for (const i of keys) {
        await telephonyService.playBeep(i);
        await sleep(16);
        expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
      }
    });
  });
  describe('onReceiveIncomingCall()', () => {
    const params = {
      fromName: 'test',
      fromNum: '456',
      callEntityId: v4(),
    };
    beforeEach(() => {
      defaultPhoneApp = CALLING_OPTIONS.GLIP;
      jest
        .spyOn(telephonyService._telephonyStore, 'incomingCall')
        .mockImplementation();
    });
    it("should not response when there's incoming call and default phone setting is RC phone", async () => {
      defaultPhoneApp = CALLING_OPTIONS.RINGCENTRAL;
      mockedSettingService.getById = jest
        .fn()
        .mockResolvedValue({ value: defaultPhoneApp });
      await telephonyService._onReceiveIncomingCall(params);
      expect(
        telephonyService._telephonyStore.incomingCall,
      ).not.toHaveBeenCalled();
    });
    it("should show ui when there's incoming call and default phone setting is Ringcentral App", async () => {
      jest
        .spyOn(mockedSettingService, 'getById')
        .mockResolvedValue({ value: 'glip' });
      await telephonyService._onReceiveIncomingCall(params);
      expect(telephonyService._telephonyStore.incomingCall).toHaveBeenCalled();
    });
    it('should set incoming call in global store if has incoming call [JPT-2222]', async () => {
      jest
        .spyOn(mockedSettingService, 'getById')
        .mockResolvedValue({ value: 'glip' });
      await telephonyService._onReceiveIncomingCall(params);
      expect(
        storeManager.getGlobalStore().get(GLOBAL_KEYS.INCOMING_CALL),
      ).toBeTruthy();
    });
  });

  describe('directCall', () => {
    it('should call ToastCallError.toastNoNetwork when get return value with MAKE_CALL_ERROR_CODE.NO_INTERNET_CONNECTION', async () => {
      const cached = mockedServerTelephonyService.makeCall;
      mockedServerTelephonyService.makeCall.mockReturnValue(
        MAKE_CALL_ERROR_CODE.NO_INTERNET_CONNECTION,
      );
      await telephonyService.directCall(v4());
      expect(ToastCallError.toastNoNetwork).toHaveBeenCalled();
      mockedServerTelephonyService.makeCall = cached;
    });

    it('should call ToastCallError.toastInvalidNumber when get return value with MAKE_CALL_ERROR_CODE.INVALID_PHONE_NUMBER', async () => {
      const cached = mockedServerTelephonyService.makeCall;
      mockedServerTelephonyService.makeCall.mockReturnValue(
        MAKE_CALL_ERROR_CODE.INVALID_PHONE_NUMBER,
      );
      await telephonyService.directCall(v4());
      expect(ToastCallError.toastInvalidNumber).toHaveBeenCalled();
      mockedServerTelephonyService.makeCall = cached;
    });

    it('should call ToastCallError.toastCountryBlockError when get return value with MAKE_CALL_ERROR_CODE.THE_COUNTRY_BLOCKED_VOIP', async () => {
      const cached = mockedServerTelephonyService.makeCall;
      mockedServerTelephonyService.makeCall.mockReturnValue(
        MAKE_CALL_ERROR_CODE.THE_COUNTRY_BLOCKED_VOIP,
      );
      await telephonyService.directCall(v4());
      expect(ToastCallError.toastCountryBlockError).toHaveBeenCalled();
      mockedServerTelephonyService.makeCall = cached;
    });

    it('should call ToastCallError.toastVoipUnavailableError when get return value with MAKE_CALL_ERROR_CODE.VOIP_CALLING_SERVICE_UNAVAILABLE', async () => {
      const cached = mockedServerTelephonyService.makeCall;
      mockedServerTelephonyService.makeCall.mockReturnValue(
        MAKE_CALL_ERROR_CODE.VOIP_CALLING_SERVICE_UNAVAILABLE,
      );
      await telephonyService.directCall(v4());
      expect(ToastCallError.toastVoipUnavailableError).toHaveBeenCalled();
      mockedServerTelephonyService.makeCall = cached;
    });

    it('should call ToastCallError.toastCallFailed when get return value with MAKE_CALL_ERROR_CODE.N11_102', async () => {
      const cached = mockedServerTelephonyService.makeCall;
      mockedServerTelephonyService.makeCall.mockReturnValue(
        MAKE_CALL_ERROR_CODE.N11_102,
      );
      await telephonyService.directCall(v4());
      expect(ToastCallError.toastCallFailed).toHaveBeenCalled();
      mockedServerTelephonyService.makeCall = cached;
    });

    it('should not call ToastCallError.toastCallFailed when get return value with MAKE_CALL_ERROR_CODE.NO_ERROR', async () => {
      const cached = mockedServerTelephonyService.makeCall;
      mockedServerTelephonyService.makeCall.mockReturnValue(
        MAKE_CALL_ERROR_CODE.NO_ERROR,
      );
      await telephonyService.directCall(v4());
      expect(ToastCallError.toastCallFailed).not.toHaveBeenCalled();
      mockedServerTelephonyService.makeCall = cached;
    });
  });

  describe('makeRCPhoneCall()', () => {
    let urlTester: Function;
    let startLoading: Function;
    let stopLoading: Function;
    let url: string;
    let clientService: ClientService;
    beforeEach(() => {
      urlTester = jest.fn();
      startLoading = jest.fn();
      stopLoading = jest.fn();
      url = 'download';
      jest
        .spyOn(Dialog, 'confirm')
        .mockReturnValue({ startLoading, stopLoading });
      mockedRCInfoService.generateWebSettingUri = jest
        .fn()
        .mockResolvedValue(url);
      Notification.flashToast = jest.fn().mockImplementation();
      clientService = container.get(CLIENT_SERVICE);
      jest
        .spyOn(clientService, 'invokeApp')
        .mockImplementation(
          (url: string, { fallback }: { fallback: Function }) => {
            urlTester(url);
            fallback();
          },
        );
      clientService.open = jest.fn().mockImplementation();
    });
    ['RC', 'ATT', 'TELUS'].forEach(i =>
      it(`should build correct url for ${i}`, () => {
        const RCPhoneCallURL = {
          RC: 'rcmobile',
          ATT: 'attvr20',
          TELUS: 'rctelus',
        };
        jest
          .spyOn(utils, 'getEntity')
          .mockImplementation(() => ({ rcBrand: i }));
        telephonyService.makeRCPhoneCall('666');
        expect(urlTester).toHaveBeenCalledWith(
          `${RCPhoneCallURL[i]}://call?number=${encodeURIComponent('666')}`,
        );
      }),
    );
    ['RC', 'ATT', 'TELUS'].forEach(i =>
      it(`should build correct url for ${i} when given access code`, () => {
        const RCPhoneCallURL = {
          RC: 'rcmobile',
          ATT: 'attvr20',
          TELUS: 'rctelus',
        };
        jest
          .spyOn(utils, 'getEntity')
          .mockImplementation(() => ({ rcBrand: i }));
        telephonyService.makeRCPhoneCall('666', '123');
        expect(urlTester).toHaveBeenCalledWith(
          `${RCPhoneCallURL[i]}://call?number=${encodeURIComponent(
            '666,,123#',
          )}`,
        );
      }),
    );
    it('should show dialog when rc phone is uninstalled [JPT-2403]', async () => {
      jest
        .spyOn(utils, 'getEntity')
        .mockImplementation(() => ({ rcBrand: 'rcmobile' }));
      await telephonyService.makeRCPhoneCall('666');
      expect(clientService.invokeApp).toHaveBeenCalled();
      setTimeout(async () => {
        expect(Dialog.confirm).toHaveBeenCalled();
        const dialogArgs = Dialog.confirm.mock.calls[0][0];
        await dialogArgs.onOK();
        expect(startLoading).toHaveBeenCalled();
        expect(stopLoading).toHaveBeenCalled();
        expect(mockedRCInfoService.generateWebSettingUri).toHaveBeenCalled();
        expect(clientService.open).toHaveReturnedWith(url);
      }, 0);
    });
    it('should show err toast when the request of Download RingCentral Phone is failed. [JPT-2407]', async () => {
      jest
        .spyOn(utils, 'getEntity')
        .mockImplementation(() => ({ rcBrand: 'rcmobile' }));
      mockedRCInfoService.generateWebSettingUri = jest
        .fn()
        .mockRejectedValue(url);
      await telephonyService.makeRCPhoneCall('666');
      setTimeout(async () => {
        expect(Dialog.confirm).toHaveBeenCalled();
        const dialogArgs = Dialog.confirm.mock.calls[0][0];
        await dialogArgs.onOK();
        expect(startLoading).toHaveBeenCalled();
        expect(stopLoading).toHaveBeenCalled();
        expect(mockedRCInfoService.generateWebSettingUri).toHaveBeenCalled();
        expect(clientService.open).not.toHaveReturnedWith(url);
        expect(Notification.flashToast).toHaveBeenCalled();
      }, 0);
    });
  });

  describe('needConfirmE911()', () => {
    it('should be true if has active digital line not confirm emergency', async () => {
      mockedRCInfoService.hasActiveDL = jest.fn().mockReturnValue(true);
      mockedServerTelephonyService.isEmergencyAddrConfirmed = jest
        .fn()
        .mockReturnValue(false);
      const ret = telephonyService.needConfirmE911();
      expect(ret).toBeTruthy();
    });
  });

  describe('switchCall()', () => {
    it('should call directCall with from number if direction is inbound call', async () => {
      const caller = {
        direction: 'Inbound',
        from: '21010',
        fromName: 'Florence Connelly',
        id: '8ec28384e8d54846beafae947febdaa9',
        sipData: {
          fromTag: '10.74.2.219-5070-285e39746afa4a2',
          toTag: 'k6rqhp560h',
        },
        to: '21007',
        toName: 'Yilia Hong',
      };
      await telephonyService.switchCall(caller as any);
      expect(mockedServerTelephonyService.switchCall).toHaveBeenCalledWith(
        '1',
        caller,
      );
    });

    it('should call directCall with from number if direction is outbound call', async () => {
      const caller = {
        direction: 'Outbound',
        from: '21010',
        fromName: 'Florence Connelly',
        id: '8ec28384e8d54846beafae947febdaa9',
        sipData: {
          fromTag: '10.74.2.219-5070-285e39746afa4a2',
          toTag: 'k6rqhp560h',
        },
        to: '21007',
        toName: 'Yilia Hong',
      };
      await telephonyService.switchCall(caller as any);
      expect(mockedServerTelephonyService.switchCall).toHaveBeenCalledWith(
        '1',
        caller,
      );
    });
  });

  describe('joinAudioConference()', () => {
    it('Join conf failed when user has no any active DL. JPT-[2755]', async () => {
      mockedServerTelephonyService.hasActiveDL = jest
        .fn()
        .mockReturnValue(false);
      mockedPhoneNumberService.isShortNumber = jest
        .fn()
        .mockResolvedValue(false);
      mockedRCInfoService.isVoipCallingAvailable = jest
        .fn()
        .mockResolvedValue(true);
      // @ts-ignore
      telephonyService._makeCall = jest.fn();
      await telephonyService.joinAudioConference('12231232312', '2');
      // @ts-ignore
      expect(telephonyService._makeCall).not.toHaveBeenCalled();
    });

    it('Join conf failed when user webRTC permission removed JPT-[2756]', async () => {
      mockedServerTelephonyService.hasActiveDL = jest
        .fn()
        .mockReturnValue(true);
      mockedRCInfoService.isVoipCallingAvailable = jest
        .fn()
        .mockResolvedValue(false);
      // @ts-ignore
      telephonyService._makeCall = jest.fn();
      await telephonyService.joinAudioConference('1', '2');
      expect(ToastCallError.toastPermissionError).toHaveBeenCalled();
      // @ts-ignore
      expect(telephonyService._makeCall).not.toHaveBeenCalled();
    });
  });

  describe('multiple calls', () => {
    it('Can NOT make call when user on a call. [JPT-2772]', async () => {
      mockedServerTelephonyService.getAllCallCount = jest
        .fn()
        .mockReturnValue(2);
      telephonyService.makeCall = jest.fn();
      const ret = await telephonyService.directCall(v4());
      expect(ret).toBeTruthy();
      expect(telephonyService.makeCall).toHaveBeenCalledTimes(0);
    });

    it('The third call would be ignored when there exist incoming call. [JPT-2775]', async done => {
      (telephonyService as any)._telephonyStore.incomingCall = jest.fn();

      await (telephonyService as any)._onReceiveIncomingCall();
      expect(
        (telephonyService as any)._telephonyStore.incomingCall,
      ).toHaveBeenCalled();
      done();

      // @ts-ignore
      telephonyService._telephonyStore._sortableListHandler.sortableListStore = {
        getIds: [1, 2],
      };
      await (telephonyService as any)._onReceiveIncomingCall();
      expect(
        (telephonyService as any)._telephonyStore.incomingCall,
      ).toHaveBeenCalled();
      done();

      // @ts-ignore
      telephonyService._telephonyStore._sortableListHandler.sortableListStore = {
        getIds: [1, 2, 3],
      };
      await (telephonyService as any)._onReceiveIncomingCall();
      expect(
        (telephonyService as any)._telephonyStore.incomingCall,
      ).not.toHaveBeenCalled();
      done();
    });

    it('Keep current state when click [End&Answer] button failed. [JPT-2779]', () => {
      call.callState = CALL_STATE.CONNECTED;

      telephonyService.endAndAnswer();
      mockedServerTelephonyService.hangUp = jest.fn();
      mockedServerTelephonyService.answer = jest.fn();

      expect(mockedServerTelephonyService.hangUp).toHaveBeenCalledTimes(0);
      expect(mockedServerTelephonyService.answer).toHaveBeenCalledTimes(0);
      expect(call.callState).toBe(CALL_STATE.CONNECTED);

      (telephonyService as any)._callEntityId = 1;
      // @ts-ignore
      telephonyService._telephonyStore._sortableListHandler.sortableListStore = {
        getIds: [1, 2],
      };
      telephonyService.endAndAnswer();
      expect(mockedServerTelephonyService.hangUp).toHaveBeenCalledTimes(1);
      expect(mockedServerTelephonyService.answer).toHaveBeenCalledTimes(1);
      expect(call.callState).toBe(CALL_STATE.CONNECTED);
    });
  });

  describe('transfer()', () => {
    it('should transfer call now success', async () => {
      const callEntityId = 'id_0';
      const toTransfer = '444555666';
      telephonyService._callEntityId = callEntityId;
      await telephonyService.transfer(TRANSFER_TYPE.BLIND_TRANSFER, toTransfer);
      expect(mockedServerTelephonyService.transfer).toHaveBeenCalledWith(
        callEntityId,
        TRANSFER_TYPE.BLIND_TRANSFER,
        toTransfer,
      );
    });
  });
});
