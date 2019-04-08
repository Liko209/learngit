/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-02 17:28:54
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyService } from '../TelephonyService';
import { v4 } from 'uuid';
import {
  TelephonyService as ServerTelephonyService,
  RTC_CALL_ACTION,
  RTC_CALL_STATE,
} from 'sdk/module/telephony';
import {
  MAKE_CALL_ERROR_CODE,
} from 'sdk/module/telephony/types';
import { PersonService } from 'sdk/module/person';
import { TelephonyStore } from '../../store/TelephonyStore';
import { ToastCallError } from '../ToastCallError';
import { container, injectable, decorate } from 'framework';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';

const testProcedureWaitingTime = 20;
const mockedDelay = 10;

// HACK: flag for changing the call action result dynamically
let count = 0;
let telephonyService: TelephonyService | null;

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);
jest.mock('../ToastCallError');
jest.mock('sdk/module/serviceLoader');

const sleep = (time: number): Promise<void> => {
  return new Promise<void>((res, rej) => {
    setTimeout(res, time);
  });
};

let mockedServerTelephonyService: any;

describe('TelephonyService', () => {
  beforeEach(() => {
    let cachedOnMadeOutgoingCall: any;
    let cachedOnCallActionSuccess: any;
    let cachedOnCallActionFailed: any;
    let cachedOnCallStateChange: any;
    let callId: string | null = null;

    mockedServerTelephonyService = {
      hold: jest.fn().mockImplementation(
        () => {
          sleep(mockedDelay).then(() => count === 3 ? // for test failure situation
            cachedOnCallActionFailed(RTC_CALL_ACTION.HOLD)
            : cachedOnCallActionSuccess(RTC_CALL_ACTION.HOLD));
        },
      ),
      unhold: jest.fn().mockImplementation(
        () => {
          sleep(mockedDelay).then(() => count === 4 ? // for test failure situation
            cachedOnCallActionFailed(RTC_CALL_ACTION.UNHOLD) :
            cachedOnCallActionSuccess(RTC_CALL_ACTION.UNHOLD));
        },
      ),
      startRecord: jest.fn().mockImplementation(() => {
        sleep(mockedDelay).then(() => cachedOnCallActionSuccess(RTC_CALL_ACTION.START_RECORD));
      }),
      stopRecord: jest.fn().mockImplementation(() => {
        sleep(mockedDelay).then(() => cachedOnCallActionSuccess(RTC_CALL_ACTION.STOP_RECORD));
      }),
      makeCall: jest.fn().mockImplementation(() => {
        callId = v4();
        cachedOnMadeOutgoingCall(callId);
        setTimeout(() => cachedOnCallStateChange(callId, RTC_CALL_STATE.CONNECTED), mockedDelay);
        return MAKE_CALL_ERROR_CODE.NO_ERROR;
      }),
      hangUp() {
        cachedOnCallStateChange(callId, RTC_CALL_STATE.DISCONNECTED);
      },
      createAccount: (
        accountDelegate: { onMadeOutgoingCall: () => void },
        callDelegate: {
          onCallActionSuccess: () => void,
          onCallStateChange: () => void,
          onCallActionFailed: () => void,
        },
      ) => {
        const { onMadeOutgoingCall } = accountDelegate;
        const { onCallActionSuccess, onCallActionFailed, onCallStateChange } = callDelegate;
        cachedOnMadeOutgoingCall = onMadeOutgoingCall;
        cachedOnCallActionSuccess = onCallActionSuccess;
        cachedOnCallStateChange = onCallStateChange;
        cachedOnCallActionFailed = onCallActionFailed;
      },
    };

    jest.spyOn(ServiceLoader, 'getInstance')
      .mockImplementation(
        (conf) => {
          switch (conf) {
            case ServiceConfig.TELEPHONY_SERVICE:
              telephonyService = mockedServerTelephonyService;
              return mockedServerTelephonyService as ServerTelephonyService;
            case ServiceConfig.PERSON_SERVICE:
            default:
              return {} as PersonService;
          }
        },
      );
    container.bind(TelephonyStore).to(TelephonyStore);
    container.bind(TelephonyService).to(TelephonyService);

    telephonyService = container.get(TelephonyService);
    (telephonyService as TelephonyService).init();
  });

  afterEach(() => {
    jest.resetAllMocks();
    container.unbindAll();
    count += 1;
  });

  describe('The "hold" button status tests', () => {
    it('The "hold" button should be disabled when an outbound call is not connected [JPT-1545]', async () => {
      await (telephonyService as TelephonyService).makeCall(v4());
      (telephonyService as TelephonyService).holdOrUnhold();

      expect((telephonyService as TelephonyService)._telephonyStore.holdDisabled).toBe(true);
      expect(mockedServerTelephonyService.hold).not.toHaveBeenCalled();

      await (telephonyService as TelephonyService).hangUp();
      expect((telephonyService as TelephonyService)._telephonyStore.holdDisabled).toBe(true);
    });

    it('User should be able to hold a call [JPT-1541]', async () => {
      await (telephonyService as TelephonyService).makeCall(v4());
      await sleep(testProcedureWaitingTime);

      (telephonyService as TelephonyService).holdOrUnhold();
      (telephonyService as TelephonyService).holdOrUnhold();

      expect((telephonyService as TelephonyService)._telephonyStore.holdDisabled).toBe(false);
      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(true);
      expect(mockedServerTelephonyService.hold).toHaveBeenCalledTimes(1);

      await (telephonyService as TelephonyService).hangUp();
      expect((telephonyService as TelephonyService)._telephonyStore.holdDisabled).toBe(true);
    });

    it('User should be able to unhold a call [JPT-1544]', async () => {
      await (telephonyService as TelephonyService).makeCall(v4());
      await sleep(testProcedureWaitingTime);
      (telephonyService as TelephonyService).holdOrUnhold();
      await sleep(testProcedureWaitingTime);
      (telephonyService as TelephonyService).holdOrUnhold();
      (telephonyService as TelephonyService).holdOrUnhold();

      expect(mockedServerTelephonyService.unhold).toHaveBeenCalledTimes(1);
      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(true);

      await sleep(testProcedureWaitingTime);

      expect((telephonyService as TelephonyService)._telephonyStore.holdDisabled).toBe(false);
      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(false);

      await (telephonyService as TelephonyService).hangUp();
      expect((telephonyService as TelephonyService)._telephonyStore.holdDisabled).toBe(true);
    });

    it('Hold button should be changed once with unexpected error [JPT-1574]', async () => {
      await (telephonyService as TelephonyService).makeCall(v4());
      await sleep(testProcedureWaitingTime);
      (telephonyService as TelephonyService).holdOrUnhold();

      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(true);

      await sleep(testProcedureWaitingTime);

      expect(ToastCallError.toastFailedToHold).toHaveBeenCalled();
      expect(ToastCallError.toastFailedToResume).not.toHaveBeenCalled();
      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(false);

      await (telephonyService as TelephonyService).hangUp();

      expect((telephonyService as TelephonyService)._telephonyStore.holdDisabled).toBe(true);
    });

    it('Unhold button should not be changed once with unexpected error', async () => {
      await (telephonyService as TelephonyService).makeCall(v4());
      await sleep(testProcedureWaitingTime);
      (telephonyService as TelephonyService).holdOrUnhold();
      await sleep(testProcedureWaitingTime);

      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(true);

      (telephonyService as TelephonyService).holdOrUnhold();

      await sleep(testProcedureWaitingTime);
      expect(ToastCallError.toastFailedToResume).toHaveBeenCalled();
      expect(ToastCallError.toastFailedToHold).not.toHaveBeenCalled();
      expect((telephonyService as TelephonyService)._telephonyStore.held).toBe(true);

      await (telephonyService as TelephonyService).hangUp();

      expect((telephonyService as TelephonyService)._telephonyStore.holdDisabled).toBe(true);
    });
  });

  describe('TelephonyService', () => {
    it('should call answer', () => {
      const callId = 'id_0';
      telephonyService.answer();
      expect(mockServerTelephonyService.answer).not.toBeCalled();
      telephonyService._callId = callId;
      telephonyService.answer();
      expect(mockServerTelephonyService.answer).toBeCalledWith(callId);
      telephonyService._callId = undefined;
    });

    it('should call ignore', () => {
      const callId = 'id_1';
      telephonyService.ignore();
      expect(mockServerTelephonyService.ignore).not.toBeCalled();
      telephonyService._callId = callId;
      telephonyService.ignore();
      expect(mockServerTelephonyService.ignore).toBeCalledWith(callId);
      telephonyService._callId = undefined;
    });

    it('should call sendToVoiceMail', () => {
      const callId = 'id_2';
      telephonyService.sendToVoiceMail();
      expect(mockServerTelephonyService.sendToVoiceMail).not.toBeCalled();
      telephonyService._callId = callId;
      telephonyService.sendToVoiceMail();
      expect(mockServerTelephonyService.sendToVoiceMail).toBeCalledWith(callId);
      telephonyService._callId = undefined;
    });

    it('should call hangUp', () => {
      const callId = 'id_3';
      telephonyService.hangUp();
      expect(mockServerTelephonyService.hangUp).not.toBeCalled();
      telephonyService._callId = callId;
      telephonyService.hangUp();
      expect(mockServerTelephonyService.hangUp).toBeCalledWith(callId);
      telephonyService._callId = undefined;
    });

    it('should call directCall', () => {
      const toNumber = '000';
      telephonyService.makeCall = jest.fn();
      mockServerTelephonyService.getAllCallCount.mockReturnValue(1);
      telephonyService.directCall(toNumber);
      expect(telephonyService.makeCall).not.toBeCalled();
      mockServerTelephonyService.getAllCallCount.mockReturnValue(0);
      telephonyService.directCall(toNumber);
      expect(telephonyService.makeCall).toBeCalledWith(toNumber);
    });

    it('should call muteOrUnmute', () => {
      const callId = 'id_4';
      telephonyService.muteOrUnmute(false);
      expect(mockServerTelephonyService.mute).not.toBeCalled();
      expect(mockServerTelephonyService.unmute).not.toBeCalled();
      telephonyService._callId = callId;
      telephonyService.muteOrUnmute(false);
      expect(mockServerTelephonyService.mute).not.toBeCalled();
      expect(mockServerTelephonyService.unmute).toBeCalled();
      jest.resetAllMocks();
      telephonyService.muteOrUnmute(true);
      expect(mockServerTelephonyService.mute).toBeCalled();
      expect(mockServerTelephonyService.unmute).not.toBeCalled();
      telephonyService._callId = undefined;
    });
  });

  describe('The "record" button status tests', () => {
    it('The "record" button should be disabled when an outbound call is not connected [JPT-1604]', async () => {
      await (telephonyService as TelephonyService).makeCall(v4());
      (telephonyService as TelephonyService).startOrStopRecording();

      expect((telephonyService as TelephonyService)._telephonyStore.recordDisabled).toBe(true);
      expect(mockedServerTelephonyService.startRecord).not.toHaveBeenCalled();

      await (telephonyService as TelephonyService).hangUp();

      expect((telephonyService as TelephonyService)._telephonyStore.recordDisabled).toBe(true);
    });

    it('Start recording if the call is connected [JPT-1600]', async () => {
      await (telephonyService as TelephonyService).makeCall(v4());
      await sleep(testProcedureWaitingTime);

      (telephonyService as TelephonyService).startOrStopRecording();
      (telephonyService as TelephonyService).startOrStopRecording();

      expect((telephonyService as TelephonyService)._telephonyStore.recordDisabled).toBe(false);
      expect((telephonyService as TelephonyService)._telephonyStore.isRecording).toBe(true);
      expect(mockedServerTelephonyService.startRecord).toHaveBeenCalledTimes(1);

      await (telephonyService as TelephonyService).hangUp();
      expect((telephonyService as TelephonyService)._telephonyStore.recordDisabled).toBe(true);
    });

    it('Stop recording should work when call is under recording [JPT-1603]', async () => {
      await (telephonyService as TelephonyService).makeCall(v4());
      await sleep(testProcedureWaitingTime);
      (telephonyService as TelephonyService).startOrStopRecording();
      await sleep(testProcedureWaitingTime);
      (telephonyService as TelephonyService).startOrStopRecording();
      (telephonyService as TelephonyService).startOrStopRecording();

      expect(mockedServerTelephonyService.stopRecord).toHaveBeenCalledTimes(1);
      expect((telephonyService as TelephonyService)._telephonyStore.isRecording).toBe(true);

      await sleep(testProcedureWaitingTime);

      expect((telephonyService as TelephonyService)._telephonyStore.recordDisabled).toBe(false);
      expect((telephonyService as TelephonyService)._telephonyStore.isRecording).toBe(false);

      await (telephonyService as TelephonyService).hangUp();
      expect((telephonyService as TelephonyService)._telephonyStore.recordDisabled).toBe(true);
    });

    it('Record shouldn\'t work when a call being holded [JPT-1608]', async () => {
      await (telephonyService as TelephonyService).makeCall(v4());
      await sleep(testProcedureWaitingTime);

      await (telephonyService as TelephonyService).holdOrUnhold();
      expect((telephonyService as TelephonyService)._telephonyStore.recordDisabled).toBe(true);

      await sleep(testProcedureWaitingTime);
      expect((telephonyService as TelephonyService)._telephonyStore.recordDisabled).toBe(true);

      await (telephonyService as TelephonyService).holdOrUnhold();
      await sleep(testProcedureWaitingTime);

      expect((telephonyService as TelephonyService)._telephonyStore.recordDisabled).toBe(false);

      await (telephonyService as TelephonyService).hangUp();
    });

    it('Should restore recording state when unhold [JPT-1608]', async () => {
      await (telephonyService as TelephonyService).makeCall(v4());
      await sleep(testProcedureWaitingTime);

      await (telephonyService as TelephonyService).startOrStopRecording();
      await sleep(testProcedureWaitingTime);

      expect((telephonyService as TelephonyService)._telephonyStore.isRecording).toBe(true);

      await (telephonyService as TelephonyService).holdOrUnhold();
      await sleep(testProcedureWaitingTime);
      await (telephonyService as TelephonyService).holdOrUnhold();
      await sleep(testProcedureWaitingTime);

      expect((telephonyService as TelephonyService)._telephonyStore.isRecording).toBe(true);

      await (telephonyService as TelephonyService).hangUp();
    });
  });
});
