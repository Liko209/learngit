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
      getCallCount: jest.fn(),
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
      telephonyService.createAccount(mockAcc);
      expect(engineController.createAccount).toHaveBeenCalledWith(mockAcc);
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
      const res = await telephonyService.makeCall('123', null);
      expect(makeCallController.getE164PhoneNumber).toHaveBeenCalled();
      expect(accountController.makeCall).toHaveBeenCalledWith('123', null);
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
  describe('getAllCallCount', () => {
    it('should call account controller to get call count', () => {
      telephonyService.getAllCallCount();
      expect(accountController.getCallCount).toHaveBeenCalled();
    });
  });
});
