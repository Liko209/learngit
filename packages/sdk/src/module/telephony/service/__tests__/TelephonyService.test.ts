/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-01 10:55:51
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyService } from '../TelephonyService';
import { TelephonyEngineController } from '../../controller/TelephonyEngineController';
import { ITelephonyAccountDelegate } from '../ITelephonyAccountDelegate';
import { MAKE_CALL_ERROR_CODE } from '../../types';
import { MakeCallController } from '../../controller/MakeCallController';
import { ITelephonyCallDelegate } from '../ITelephonyCallDelegate';
import {
  RTC_CALL_ACTION,
  RTC_CALL_STATE,
  RTCCallActionSuccessOptions,
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
} from 'voip';
import { TelephonyAccountController } from '../../controller/TelephonyAccountController';
import { ServiceLoader } from '../../../serviceLoader';
import { TelephonyUserConfig } from '../../config/TelephonyUserConfig';

jest.mock('../../controller/TelephonyEngineController');
jest.mock('../../controller/TelephonyAccountController');
jest.mock('../../controller/MakeCallController');
jest.mock('../../../config');
ServiceLoader.getInstance = jest.fn();

describe('TelephonyService', () => {
  let telephonyService: TelephonyService;
  let engineController: TelephonyEngineController;
  let accountController;
  let makeCallController: MakeCallController;

  const callId = '123';
  const toNum = '123';
  class MockAcc implements ITelephonyAccountDelegate {
    onAccountStateChanged(state: TELEPHONY_ACCOUNT_STATE) {}
  }

  class MockCall implements ITelephonyCallDelegate {
    onCallStateChange(callId: string, state: RTC_CALL_STATE) {}
    onCallActionSuccess(
      callAction: RTC_CALL_ACTION,
      options: RTCCallActionSuccessOptions,
    ) {}
    onCallActionFailed(callAction: RTC_CALL_ACTION) {}
  }

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  }

  function setup() {
    telephonyService = new TelephonyService();
    engineController = new TelephonyEngineController();
    accountController = new TelephonyAccountController(null, null, null);

    engineController.getAccountController = jest
      .fn()
      .mockReturnValue(accountController);
    makeCallController = new MakeCallController();
    Object.assign(telephonyService, {
      _telephonyEngineController: engineController,
      _makeCallController: makeCallController,
    });
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  describe('handleLogOut', () => {
    it('should call logout', () => {
      engineController.logout = jest.fn();
      telephonyService.handleLogOut();
      expect(engineController.logout).toBeCalled();
    });
  });

  describe('telephonyController', () => {
    it('should create telephonyController', () => {
      telephonyService['_telephonyEngineController'] = undefined as any;
      telephonyService['telephonyController'];
      expect(TelephonyEngineController).toBeCalled();
    });
  });

  describe('_init', () => {
    it('should call initEngine', () => {
      engineController.initEngine = jest.fn();
      telephonyService['_init']();
      expect(engineController.initEngine).toBeCalled();
    });
  });

  describe('userConfig', () => {
    it('should create userConfig', () => {
      telephonyService.userConfig;
      expect(TelephonyUserConfig).toBeCalled();
    });
  });

  describe('createAccount', () => {
    it('should call controller to create account', () => {
      const mockAcc = new MockAcc();
      const mockCall = new MockCall();
      telephonyService.createAccount(mockAcc, mockCall);
      expect(engineController.createAccount).toHaveBeenCalledWith(
        mockAcc,
        mockCall,
      );
    });
  });
  describe('makeCall', () => {
    it('should call account controller to make call', async () => {
      await telephonyService.makeCall('123', '456');
      expect(accountController.makeCall).toHaveBeenCalledWith('123', '456');
    });

    it('should return error when account controller is not created', async () => {
      engineController.getAccountController = jest
        .fn()
        .mockReturnValueOnce(null);
      const result = await telephonyService.makeCall(toNum);
      expect(accountController.makeCall).not.toHaveBeenCalled();
      expect(result).toBe(MAKE_CALL_ERROR_CODE.INVALID_STATE);
    });
  });

  describe('hangUp', () => {
    it('should call account controller to hang up ', () => {
      telephonyService.hangUp('123');
      expect(accountController.hangUp).toHaveBeenCalledWith('123');
    });
  });
  describe('mute', () => {
    it('should call account controller to mute', () => {
      telephonyService.mute('123');
      expect(accountController.mute).toHaveBeenCalledWith('123');
    });
  });
  describe('unmute', () => {
    it('should call account controller to unmute', () => {
      telephonyService.unmute('123');
      expect(accountController.unmute).toHaveBeenCalledWith('123');
    });
  });
  describe('hold', () => {
    it('should call account controller to hold', () => {
      telephonyService.hold('123');
      expect(accountController.hold).toHaveBeenCalledWith('123');
    });
  });
  describe('unhold', () => {
    it('should call account controller to unhold', () => {
      telephonyService.unhold('123');
      expect(accountController.unhold).toHaveBeenCalledWith('123');
    });
  });
  describe('startRecord', () => {
    it('should call account controller to startRecord', () => {
      telephonyService.startRecord('123');
      expect(accountController.startRecord).toHaveBeenCalledWith('123');
    });
  });
  describe('stopRecord', () => {
    it('should call account controller to stopRecord', () => {
      telephonyService.stopRecord('123');
      expect(accountController.stopRecord).toHaveBeenCalledWith('123');
    });
  });
  describe('dtmf', () => {
    it('should call account controller to dtmf', () => {
      telephonyService.dtmf('123', '456');
      expect(accountController.dtmf).toHaveBeenCalledWith('123', '456');
    });
  });
  describe('getAllCallCount', () => {
    it('should call account controller to get call count', () => {
      telephonyService.getAllCallCount();
      expect(accountController.getCallCount).toHaveBeenCalled();
    });
  });

  describe('answer', () => {
    it('should call account controller to answer call', () => {
      telephonyService.answer(callId);
      expect(accountController.answer).toHaveBeenCalledWith(callId);
    });
  });

  describe('sendToVoiceMail', () => {
    it('should call account controller to send call to voice mail', () => {
      telephonyService.sendToVoiceMail(callId);
      expect(accountController.sendToVoiceMail).toHaveBeenCalledWith(callId);
    });
  });

  describe('ignore', () => {
    it('should call account controller to ignore', () => {
      telephonyService.ignore(callId);
      expect(accountController.ignore).toHaveBeenCalledWith(callId);
    });
  });

  describe('startReply', () => {
    it('should call account controller to startReply', () => {
      telephonyService.startReply(callId);
      expect(accountController.startReply).toHaveBeenCalledWith(callId);
    });
  });

  describe('replyWithMessage', () => {
    it('should call account controller to replyWithMessage', () => {
      const message = 'test message';
      telephonyService.replyWithMessage(callId, message);
      expect(accountController.replyWithMessage).toHaveBeenCalledWith(
        callId,
        message,
      );
    });
  });

  describe('replyWithPattern', () => {
    it('should call account controller to replyWithPattern', () => {
      const pattern = RTC_REPLY_MSG_PATTERN.WILL_CALL_YOU_BACK_LATER;
      const time = 13;
      const timeUnit = RTC_REPLY_MSG_TIME_UNIT.MINUTE;
      telephonyService.replyWithPattern(callId, pattern, time, timeUnit);
      expect(accountController.replyWithPattern).toHaveBeenCalledWith(
        callId,
        pattern,
        time,
        timeUnit,
      );
    });
  });

  describe('getLastCalledNumber', () => {
    it('should call account controller to get last called number', () => {
      const spy = jest.spyOn(accountController, 'getLastCalledNumber');
      telephonyService.getLastCalledNumber();
      expect(spy).toBeCalled();
    });
  });
});
