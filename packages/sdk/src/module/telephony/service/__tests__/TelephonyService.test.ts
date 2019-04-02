/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-01 10:55:51
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyService } from '../TelephonyService';
import { TelephonyEngineController } from '../../controller/TelephonyEngineController';
import { ITelephonyAccountDelegate } from '../ITelephonyAccountDelegate';
import { TELEPHONY_ACCOUNT_STATE, MAKE_CALL_ERROR_CODE } from '../../types';
import { GlobalConfigService } from '../../../config';
import { MakeCallController } from '../../controller/MakeCallController';
import { ITelephonyCallDelegate } from '../ITelephonyCallDelegate';
import {
  RTC_CALL_ACTION,
  RTC_CALL_STATE,
  RTCCallActionSuccessOptions,
} from 'voip';

jest.mock('../../controller/TelephonyEngineController');
jest.mock('../../controller/TelephonyAccountController');
jest.mock('../../controller/MakeCallController');
jest.mock('../../../config');
GlobalConfigService.getInstance = jest.fn();

describe('TelephonyService', () => {
  let telephonyService: TelephonyService;
  let engineController: TelephonyEngineController;
  let accountController;
  let makeCallController: MakeCallController;

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
    accountController = {
      makeCall: jest.fn(),
      hangUp: jest.fn(),
      mute: jest.fn(),
      unmute: jest.fn(),
      getCallCount: jest.fn(),
      hold: jest.fn(),
      unhold: jest.fn(),
      startRecord: jest.fn(),
      stopRecord: jest.fn(),
      dtmf: jest.fn(),
    };

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
      jest
        .spyOn(makeCallController, 'getE164PhoneNumber')
        .mockReturnValue('123');
      jest
        .spyOn(makeCallController, 'tryMakeCall')
        .mockReturnValue(MAKE_CALL_ERROR_CODE.NO_ERROR);
      const res = await telephonyService.makeCall('123');
      expect(makeCallController.getE164PhoneNumber).toHaveBeenCalled();
      expect(accountController.makeCall).toHaveBeenCalledWith('123');
      expect(res).toBe(MAKE_CALL_ERROR_CODE.NO_ERROR);
    });

    it('should not call account controller to make call when getting errors', async () => {
      jest
        .spyOn(makeCallController, 'getE164PhoneNumber')
        .mockReturnValue('123');
      jest
        .spyOn(makeCallController, 'tryMakeCall')
        .mockReturnValue(MAKE_CALL_ERROR_CODE.N11_101);
      const res = await telephonyService.makeCall('123', null);
      expect(makeCallController.getE164PhoneNumber).toHaveBeenCalled();
      expect(accountController.makeCall).not.toHaveBeenCalledWith('123', null);
      expect(res).toBe(MAKE_CALL_ERROR_CODE.N11_101);
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
});
