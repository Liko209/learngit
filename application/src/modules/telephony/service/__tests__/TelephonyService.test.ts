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
  RTC_CALL_ACTION,
  RTC_CALL_STATE,
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
} from 'sdk/module/telephony';
import { MAKE_CALL_ERROR_CODE } from 'sdk/module/telephony/types';
import { PersonService } from 'sdk/module/person';
import { TelephonyStore } from '../../store/TelephonyStore';
import { ToastCallError } from '../ToastCallError';
import { container, injectable, decorate } from 'framework';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { ClientService } from '@/modules/common';
import { CALLING_OPTIONS } from 'sdk/module/profile';
const testProcedureWaitingTime = 20;
const mockedDelay = 10;

// HACK: flag for changing the call action result dynamically
let count = 0;
let telephonyService: TelephonyService;

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);
decorate(injectable(), ClientService);

jest.mock('../ToastCallError');

// mock media element methods
window.HTMLMediaElement.prototype.load = jest.fn();
window.HTMLMediaElement.prototype.play = jest.fn();
window.HTMLMediaElement.prototype.pause = jest.fn();
window.HTMLMediaElement.prototype.addTextTrack = jest.fn();

const sleep = (time: number): Promise<void> => {
  return new Promise<void>((res, rej) => {
    setTimeout(res, time);
  });
};

let mockedServerTelephonyService: any;

function initializeCallerId() {
  telephonyService._telephonyStore.chosenCallerPhoneNumber = '123';
  telephonyService._telephonyStore.callerPhoneNumberList = [
    { id: '123', phoneNumber: '123', usageType: 'companyNumber' },
  ];
}
let defaultPhoneApp = CALLING_OPTIONS.GLIP;
describe('TelephonyService', () => {
  beforeEach(() => {
    let cachedOnMadeOutgoingCall: any;
    let cachedOnCallActionSuccess: any;
    let cachedOnCallActionFailed: any;
    let cachedOnCallStateChange: any;
    let callId: string | null = null;
    jest.spyOn(utils, 'getSingleEntity').mockReturnValue(defaultPhoneApp);
    mockedServerTelephonyService = {
      hold: jest.fn().mockImplementation(() => {
        sleep(mockedDelay).then(() =>
          count === 3 // for test failure situation
            ? cachedOnCallActionFailed(RTC_CALL_ACTION.HOLD)
            : cachedOnCallActionSuccess(RTC_CALL_ACTION.HOLD),
        );
      }),
      unhold: jest.fn().mockImplementation(() => {
        sleep(mockedDelay).then(() =>
          count === 4 // for test failure situation
            ? cachedOnCallActionFailed(RTC_CALL_ACTION.UNHOLD)
            : cachedOnCallActionSuccess(RTC_CALL_ACTION.UNHOLD),
        );
      }),
      startRecord: jest.fn().mockImplementation(() => {
        sleep(mockedDelay).then(() =>
          cachedOnCallActionSuccess(RTC_CALL_ACTION.START_RECORD),
        );
      }),
      stopRecord: jest.fn().mockImplementation(() => {
        sleep(mockedDelay).then(() =>
          cachedOnCallActionSuccess(RTC_CALL_ACTION.STOP_RECORD),
        );
      }),
      makeCall: jest.fn().mockImplementation(() => {
        callId = v4();
        cachedOnMadeOutgoingCall(callId);
        setTimeout(
          () => cachedOnCallStateChange(callId, RTC_CALL_STATE.CONNECTED),
          mockedDelay,
        );
        return MAKE_CALL_ERROR_CODE.NO_ERROR;
      }),
      hangUp: jest.fn().mockImplementation(() => {
        cachedOnCallStateChange(callId, RTC_CALL_STATE.DISCONNECTED);
      }),
      createAccount: (
        accountDelegate: { onMadeOutgoingCall: () => void },
        callDelegate: {
          onCallActionSuccess: () => void;
          onCallStateChange: () => void;
          onCallActionFailed: () => void;
        },
      ) => {
        const { onMadeOutgoingCall } = accountDelegate;
        const {
          onCallActionSuccess,
          onCallActionFailed,
          onCallStateChange,
        } = callDelegate;
        cachedOnMadeOutgoingCall = onMadeOutgoingCall;
        cachedOnCallActionSuccess = onCallActionSuccess;
        cachedOnCallStateChange = onCallStateChange;
        cachedOnCallActionFailed = onCallActionFailed;
      },
      answer: jest.fn(),
      sendToVoiceMail: jest.fn(),
      ignore: jest.fn(),
      getAllCallCount: jest.fn(),
      mute: jest.fn(),
      unmute: jest.fn(),
      dtmf: jest.fn(),
      getLastCalledNumber: jest.fn(),
      startReply: jest.fn(),
      replyWithMessage: jest.fn(),
      replyWithPattern: jest.fn(),
    };

    jest.spyOn(ServiceLoader, 'getInstance').mockImplementation((conf) => {
      switch (conf) {
        case ServiceConfig.TELEPHONY_SERVICE:
          telephonyService = mockedServerTelephonyService;
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
          return { get: jest.fn(), getCallerIdList: jest.fn() };
        case ServiceConfig.ACCOUNT_SERVICE:
          return { userConfig: { getGlipUserId: jest.fn() } };
        default:
          return {} as PersonService;
      }
    });
    container.bind(CLIENT_SERVICE).to(ClientService);
    container.bind(TelephonyStore).to(TelephonyStore);
    container.bind(TelephonyService).to(TelephonyService);
    telephonyService = container.get(TelephonyService);
    (telephonyService as TelephonyService).init();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    container.unbindAll();
    count += 1;
  });

  describe('The "hold" button status tests', () => {
    it('The "hold" button should be disabled when an outbound call is not connected [JPT-1545]', async () => {
      initializeCallerId();
      await (telephonyService as TelephonyService).makeCall(v4());
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
      initializeCallerId();
      await (telephonyService as TelephonyService).makeCall(v4());
      await sleep(testProcedureWaitingTime);

      (telephonyService as TelephonyService).holdOrUnhold();
      (telephonyService as TelephonyService).holdOrUnhold();

      expect(
        (telephonyService as TelephonyService)._telephonyStore.holdDisabled,
      ).toBe(false);
      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(
        true,
      );
      expect(mockedServerTelephonyService.hold).toHaveBeenCalledTimes(1);

      await (telephonyService as TelephonyService).hangUp();
      expect(
        (telephonyService as TelephonyService)._telephonyStore.holdDisabled,
      ).toBe(true);
    });

    it('User should be able to unhold a call [JPT-1544]', async () => {
      initializeCallerId();
      await (telephonyService as TelephonyService).makeCall(v4());
      await sleep(testProcedureWaitingTime);
      (telephonyService as TelephonyService).holdOrUnhold();
      await sleep(testProcedureWaitingTime);
      (telephonyService as TelephonyService).holdOrUnhold();
      (telephonyService as TelephonyService).holdOrUnhold();

      expect(mockedServerTelephonyService.unhold).toHaveBeenCalledTimes(1);
      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(
        true,
      );

      await sleep(testProcedureWaitingTime);

      expect(
        (telephonyService as TelephonyService)._telephonyStore.holdDisabled,
      ).toBe(false);
      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(
        false,
      );

      await (telephonyService as TelephonyService).hangUp();
      expect(
        (telephonyService as TelephonyService)._telephonyStore.holdDisabled,
      ).toBe(true);
    });

    it('Hold button should be changed once with unexpected error [JPT-1574]', async () => {
      initializeCallerId();
      await (telephonyService as TelephonyService).makeCall(v4());
      await sleep(testProcedureWaitingTime);
      (telephonyService as TelephonyService).holdOrUnhold();

      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(
        true,
      );

      await sleep(testProcedureWaitingTime);

      expect(ToastCallError.toastFailedToHold).toHaveBeenCalled();
      expect(ToastCallError.toastFailedToResume).not.toHaveBeenCalled();
      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(
        false,
      );

      await (telephonyService as TelephonyService).hangUp();

      expect(
        (telephonyService as TelephonyService)._telephonyStore.holdDisabled,
      ).toBe(true);
    });

    it('Unhold button should not be changed once with unexpected error', async () => {
      initializeCallerId();
      await (telephonyService as TelephonyService).makeCall(v4());
      await sleep(testProcedureWaitingTime);
      (telephonyService as TelephonyService).holdOrUnhold();
      await sleep(testProcedureWaitingTime);

      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(
        true,
      );

      (telephonyService as TelephonyService).holdOrUnhold();

      await sleep(testProcedureWaitingTime);
      expect(ToastCallError.toastFailedToResume).toHaveBeenCalled();
      expect(ToastCallError.toastFailedToHold).not.toHaveBeenCalled();
      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(
        true,
      );

      await (telephonyService as TelephonyService).hangUp();

      expect(
        (telephonyService as TelephonyService)._telephonyStore.holdDisabled,
      ).toBe(true);
    });
  });

  describe('The "record" button status tests', () => {
    it('The "record" button should be disabled when an outbound call is not connected [JPT-1604]', async () => {
      initializeCallerId();
      await (telephonyService as TelephonyService).makeCall(v4());
      (telephonyService as TelephonyService).startOrStopRecording();

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
      initializeCallerId();
      await (telephonyService as TelephonyService).makeCall(v4());
      await sleep(testProcedureWaitingTime);

      (telephonyService as TelephonyService).startOrStopRecording();
      (telephonyService as TelephonyService).startOrStopRecording();

      expect(
        (telephonyService as TelephonyService)._telephonyStore.recordDisabled,
      ).toBe(false);
      expect(
        (telephonyService as TelephonyService)._telephonyStore.isRecording,
      ).toBe(true);
      expect(mockedServerTelephonyService.startRecord).toHaveBeenCalledTimes(1);

      await (telephonyService as TelephonyService).hangUp();
      expect(
        (telephonyService as TelephonyService)._telephonyStore.recordDisabled,
      ).toBe(true);
    });

    it('Stop recording should work when call is under recording [JPT-1603]', async () => {
      initializeCallerId();
      await (telephonyService as TelephonyService).makeCall(v4());
      await sleep(testProcedureWaitingTime);
      (telephonyService as TelephonyService).startOrStopRecording();
      await sleep(testProcedureWaitingTime);
      (telephonyService as TelephonyService).startOrStopRecording();
      (telephonyService as TelephonyService).startOrStopRecording();

      expect(mockedServerTelephonyService.stopRecord).toHaveBeenCalledTimes(1);
      expect(
        (telephonyService as TelephonyService)._telephonyStore.isRecording,
      ).toBe(true);

      await sleep(testProcedureWaitingTime);

      expect(
        (telephonyService as TelephonyService)._telephonyStore.recordDisabled,
      ).toBe(false);
      expect(
        (telephonyService as TelephonyService)._telephonyStore.isRecording,
      ).toBe(false);

      await (telephonyService as TelephonyService).hangUp();
      expect(
        (telephonyService as TelephonyService)._telephonyStore.recordDisabled,
      ).toBe(true);
    });

    it("Record shouldn't work when a call being holded [JPT-1608]", async () => {
      initializeCallerId();
      await (telephonyService as TelephonyService).makeCall(v4());
      await sleep(testProcedureWaitingTime);

      await (telephonyService as TelephonyService).holdOrUnhold();
      expect(
        (telephonyService as TelephonyService)._telephonyStore.recordDisabled,
      ).toBe(true);

      await sleep(testProcedureWaitingTime);
      expect(
        (telephonyService as TelephonyService)._telephonyStore.recordDisabled,
      ).toBe(true);

      await (telephonyService as TelephonyService).holdOrUnhold();
      await sleep(testProcedureWaitingTime);

      expect(
        (telephonyService as TelephonyService)._telephonyStore.recordDisabled,
      ).toBe(false);

      await (telephonyService as TelephonyService).hangUp();
    });

    it('Should restore recording state when unhold [JPT-1608]', async () => {
      initializeCallerId();
      await (telephonyService as TelephonyService).makeCall(v4());
      await sleep(testProcedureWaitingTime);

      await (telephonyService as TelephonyService).startOrStopRecording();
      await sleep(testProcedureWaitingTime);

      expect(
        (telephonyService as TelephonyService)._telephonyStore.isRecording,
      ).toBe(true);

      await (telephonyService as TelephonyService).holdOrUnhold();
      await sleep(testProcedureWaitingTime);
      await (telephonyService as TelephonyService).holdOrUnhold();
      await sleep(testProcedureWaitingTime);

      expect(
        (telephonyService as TelephonyService)._telephonyStore.isRecording,
      ).toBe(true);

      await (telephonyService as TelephonyService).hangUp();
    });
  });

  describe('TelephonyService', () => {
    it('should call answer', () => {
      const callId = 'id_0';
      telephonyService.answer();
      expect(mockedServerTelephonyService.answer).not.toBeCalled();
      telephonyService._callId = callId;
      telephonyService.answer();
      expect(mockedServerTelephonyService.answer).toBeCalledWith(callId);
      telephonyService._callId = undefined;
    });

    it('should call ignore', () => {
      const callId = 'id_1';
      telephonyService.ignore();
      expect(mockedServerTelephonyService.ignore).not.toBeCalled();
      telephonyService._callId = callId;
      telephonyService.ignore();
      expect(mockedServerTelephonyService.ignore).toBeCalledWith(callId);
      telephonyService._callId = undefined;
    });

    it('should call sendToVoiceMail', () => {
      const callId = 'id_2';
      telephonyService.sendToVoiceMail();
      expect(mockedServerTelephonyService.sendToVoiceMail).not.toBeCalled();
      telephonyService._callId = callId;
      telephonyService.sendToVoiceMail();
      expect(mockedServerTelephonyService.sendToVoiceMail).toBeCalledWith(
        callId,
      );
      telephonyService._callId = undefined;
    });

    it('should call hangUp', () => {
      const callId = 'id_3';
      telephonyService.hangUp();
      expect(mockedServerTelephonyService.hangUp).not.toBeCalled();
      telephonyService._callId = callId;
      telephonyService.hangUp();
      expect(mockedServerTelephonyService.hangUp).toBeCalledWith(callId);
      telephonyService._callId = undefined;
    });

    it('should call directCall', () => {
      const toNumber = '000';
      telephonyService.makeCall = jest.fn();
      mockedServerTelephonyService.getAllCallCount.mockReturnValue(1);
      telephonyService.directCall(toNumber);
      expect(telephonyService.makeCall).not.toBeCalled();
      mockedServerTelephonyService.getAllCallCount.mockReturnValue(0);
      telephonyService.directCall(toNumber);
      expect(telephonyService.makeCall).toBeCalledWith(toNumber);
    });

    it('should call muteOrUnmute', () => {
      const callId = 'id_4';
      telephonyService.muteOrUnmute();
      expect(mockedServerTelephonyService.mute).not.toBeCalled();
      expect(mockedServerTelephonyService.unmute).not.toBeCalled();
      telephonyService._callId = callId;
      telephonyService.muteOrUnmute();
      expect(mockedServerTelephonyService.mute).toBeCalled();
      expect(mockedServerTelephonyService.unmute).not.toBeCalled();
      jest.resetAllMocks();
      telephonyService.muteOrUnmute();
      expect(mockedServerTelephonyService.mute).not.toBeCalled();
      expect(mockedServerTelephonyService.unmute).toBeCalled();
      telephonyService._callId = undefined;
    });

    it('should maximize and minimize', () => {
      const telephonyStore = telephonyService._telephonyStore;
      telephonyService._telephonyStore = {
        closeDialer: jest.fn(),
        openDialer: jest.fn(),
      };
      telephonyService.maximize();
      expect(telephonyService._telephonyStore.openDialer).toBeCalled();
      telephonyService.minimize();
      expect(telephonyService._telephonyStore.closeDialer).toBeCalled();
      telephonyService._telephonyStore = telephonyStore;
    });

    it('should call dtmf', () => {
      const callId = 'id_5';
      const dtmf = `${Math.ceil(Math.random() * 10)}`;
      telephonyService._callId = callId;
      telephonyService.dtmf(dtmf);
      expect(mockedServerTelephonyService.dtmf).toBeCalledWith(callId, dtmf);
    });

    it('should call startReply', () => {
      const callId = 'id_0';
      telephonyService.startReply();
      expect(mockedServerTelephonyService.startReply).not.toBeCalled();
      telephonyService._callId = callId;
      telephonyService.startReply();
      expect(mockedServerTelephonyService.startReply).toBeCalledWith(callId);
      telephonyService._callId = undefined;
    });

    it('should call replyWithMessage', () => {
      const callId = 'id_0';
      const message = 'test';
      telephonyService.replyWithMessage(message);
      expect(mockedServerTelephonyService.replyWithMessage).not.toBeCalled();
      telephonyService._callId = callId;
      telephonyService.replyWithMessage(message);
      expect(mockedServerTelephonyService.replyWithMessage).toBeCalledWith(
        callId,
        message,
      );
      telephonyService._callId = undefined;
    });

    it('should call replyWithPattern', () => {
      const callId = 'id_0';
      const pattern = RTC_REPLY_MSG_PATTERN.IN_A_MEETING;
      const time = 5;
      const timeUnit = RTC_REPLY_MSG_TIME_UNIT.MINUTE;
      telephonyService.replyWithPattern(pattern, time, timeUnit);
      expect(mockedServerTelephonyService.replyWithPattern).not.toBeCalled();
      telephonyService._callId = callId;
      telephonyService.replyWithPattern(pattern, time, timeUnit);
      expect(mockedServerTelephonyService.replyWithPattern).toBeCalledWith(
        callId,
        pattern,
        time,
        timeUnit,
      );
      telephonyService._callId = undefined;
    });
  });

  it('should limit string length to 30', () => {
    const original = Array(50)
      .fill(1)
      .join('');
    telephonyService.updateInputString(original);
    expect(telephonyService._telephonyStore.inputString.length).toBe(30);
  });

  it('can not input once hit length limitation', () => {
    const original = Array(30)
      .fill(1)
      .join('');
    telephonyService.updateInputString(original);
    telephonyService.concatInputString('2');
    expect(telephonyService._telephonyStore.inputString).toBe(original);
  });

  it('should clear the input field after make call', async () => {
    telephonyService._telephonyStore.inputString = '1234';
    initializeCallerId();
    await (telephonyService as TelephonyService).makeCall(
      telephonyService._telephonyStore.inputString,
    );
    telephonyService._telephonyStore.dialerCall();
    expect(
      (telephonyService as TelephonyService)._telephonyStore.inputString,
    ).toBe('');
  });

  it('should restore the input field after interruption of an incoming call', async () => {
    telephonyService.maximize();
    const inputString = '1234';
    telephonyService._telephonyStore.inputString = inputString;
    initializeCallerId();
    const incomingId = v4();
    telephonyService._onReceiveIncomingCall({
      fromName: 'test',
      fromNum: '456',
      callId: incomingId,
    });
    telephonyService._onCallStateChange(
      incomingId,
      RTC_CALL_STATE.DISCONNECTED,
    );
    expect(
      (telephonyService as TelephonyService)._telephonyStore.inputString,
    ).toBe(inputString);
  });

  it('should call getLastCalledNumber() on SDK', () => {
    telephonyService.lastCalledNumber;
    expect(mockedServerTelephonyService.getLastCalledNumber).toHaveBeenCalled();
  });

  it('should increase the string length on the input field', () => {
    telephonyService.maximize();
    const inputString = '1234';
    telephonyService._telephonyStore.inputString = inputString;
    telephonyService.concatInputString('5');
    expect(
      (telephonyService as TelephonyService)._telephonyStore.inputString,
    ).toBe('12345');
  });

  it('should decrease the string length on the input field', () => {
    telephonyService.maximize();
    const inputString = '1234';
    telephonyService._telephonyStore.inputString = inputString;
    telephonyService.deleteInputString();
    expect(
      (telephonyService as TelephonyService)._telephonyStore.inputString,
    ).toBe('123');
  });

  it('should clear all the string length on the input field', () => {
    telephonyService.maximize();
    const inputString = '1234';
    telephonyService._telephonyStore.inputString = inputString;
    telephonyService.deleteInputString(true);
    expect(
      (telephonyService as TelephonyService)._telephonyStore.inputString,
    ).toBe('');
  });
  describe(`onReceiveIncomingCall()`, () => {
    const params = {
      fromName: 'test',
      fromNum: '456',
      callId: v4(),
    };
    beforeEach(() => {
      jest.clearAllMocks();
      defaultPhoneApp = CALLING_OPTIONS.GLIP;
      jest
        .spyOn(telephonyService._telephonyStore, 'incomingCall')
        .mockImplementation();
    });
    it(`should not response when there's incoming call and default phone setting is RC phone`, () => {
      defaultPhoneApp = CALLING_OPTIONS.RINGCENTRAL;
      jest.spyOn(utils, 'getSingleEntity').mockReturnValue(defaultPhoneApp);
      telephonyService._onReceiveIncomingCall(params);
      expect(telephonyService._telephonyStore.incomingCall).not.toBeCalled();
    });
    it(`should show ui when there's incoming call and default phone setting is Ringcentral App`, () => {
      jest.spyOn(utils, 'getSingleEntity').mockReturnValue('glip');
      telephonyService._onReceiveIncomingCall(params);
      expect(telephonyService._telephonyStore.incomingCall).toBeCalled();
    });
  });

  describe(`makeRCPhoneCall()`, () => {
    let testedFn;
    beforeEach(() => {
      jest.clearAllMocks();
      const clientService = container.get(CLIENT_SERVICE);
      testedFn = jest.spyOn(clientService, 'invokeApp').mockImplementation();
    });
    ['RC', 'ATT', 'TELUS'].forEach((i) =>
      it(`should build correct url for ${i}`, () => {
        const RCPhoneCallURL = {
          RC: 'rcmobile',
          ATT: 'attvr20',
          TELUS: 'rctelus',
        };
        jest
          .spyOn(utils, 'getEntity')
          .mockImplementation(() => ({ rcBrand: i }));
        telephonyService.makeRCPhoneCall(666);
        expect(testedFn).toBeCalledWith(
          `${RCPhoneCallURL[i]}://call?number=${encodeURIComponent('666')}`,
        );
      }),
    );
  });
});
