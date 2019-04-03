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

const testProcedureWaitingTime = 500;
const mockedDelay = 200;
// HACK: flag for changing the call action result dynamically
let count = 0;

let telephonyService: TelephonyService | null;

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);
jest.mock('../ToastCallError');

const sleep = (time: number): Promise<void> => {
  return new Promise<void>((res, rej) => {
    setTimeout(res, time);
  });
};

let mockedServerTelephonyService: any;

describe('HoldVM', () => {
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
          sleep(mockedDelay).then(() => count === 3 ? // for test failure situation
            cachedOnCallActionFailed(RTC_CALL_ACTION.UNHOLD) :
            cachedOnCallActionSuccess(RTC_CALL_ACTION.UNHOLD));
        },
      ),
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
    jest.spyOn(ServerTelephonyService, 'getInstance').mockReturnValue(mockedServerTelephonyService);
    jest.spyOn(PersonService, 'getInstance').mockReturnValue({});
    container.bind(TelephonyStore).to(TelephonyStore);
    container.bind(TelephonyService).to(TelephonyService);

    telephonyService = container.get(TelephonyService);
    telephonyService.init();
  });

  afterEach(() => {
    jest.resetAllMocks();
    container.unbindAll();
    count += 1;
  });

  describe('The "hold" button status tests', () => {
    it('The "hold" button should be disabled when the outbound call is not connected [JPT-1545]', async () => {
      await (telephonyService as TelephonyService).makeCall(v4());
      (telephonyService as TelephonyService).hold();
      expect((telephonyService as TelephonyService).isHoldDisabled()).toBe(true);
      expect(mockedServerTelephonyService.hold).not.toHaveBeenCalled();
      await sleep(testProcedureWaitingTime);
      (telephonyService as TelephonyService).hold();
      expect((telephonyService as TelephonyService).isHoldDisabled()).toBe(false);
      expect(mockedServerTelephonyService.hold).toHaveBeenCalled();
      expect((telephonyService as TelephonyService).isHeld()).toBe(true);
      await (telephonyService as TelephonyService).hangUp();
      expect((telephonyService as TelephonyService).isHoldDisabled()).toBe(true);
    });

    it('User should be able to hold the call [JPT-1541]', async () => {
      await (telephonyService as TelephonyService).makeCall(v4());
      await sleep(testProcedureWaitingTime);
      (telephonyService as TelephonyService).hold();
      expect((telephonyService as TelephonyService).isHoldDisabled()).toBe(false);
      expect(mockedServerTelephonyService.hold).toHaveBeenCalled();
      expect((telephonyService as TelephonyService).isHeld()).toBe(true);
      await (telephonyService as TelephonyService).hangUp();
      expect((telephonyService as TelephonyService).isHoldDisabled()).toBe(true);
    });

    it('User should be able to unhold the call [JPT-1544]', async () => {
      await (telephonyService as TelephonyService).makeCall(v4());
      await sleep(testProcedureWaitingTime);
      (telephonyService as TelephonyService).hold();
      await sleep(testProcedureWaitingTime);
      (telephonyService as TelephonyService).unhold();
      expect(mockedServerTelephonyService.unhold).toHaveBeenCalled();
      expect((telephonyService as TelephonyService).isHeld()).toBe(true);
      await sleep(testProcedureWaitingTime);
      expect((telephonyService as TelephonyService).isHoldDisabled()).toBe(false);
      expect((telephonyService as TelephonyService).isHeld()).toBe(false);
      await (telephonyService as TelephonyService).hangUp();
      expect((telephonyService as TelephonyService).isHoldDisabled()).toBe(true);
    });

    it('Hold/Unhold button should be changed once with unexpected error [JPT-1574]', async () => {
      await (telephonyService as TelephonyService).makeCall(v4());
      await sleep(testProcedureWaitingTime);
      (telephonyService as TelephonyService).hold();
      expect((telephonyService as TelephonyService).isHeld()).toBe(true);
      await sleep(testProcedureWaitingTime);
      expect((telephonyService as TelephonyService).isHeld()).toBe(false);
      await (telephonyService as TelephonyService).hangUp();
      expect((telephonyService as TelephonyService).isHoldDisabled()).toBe(true);
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
});
