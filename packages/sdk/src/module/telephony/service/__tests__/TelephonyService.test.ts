/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-01 10:55:51
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyService } from '../TelephonyService';
import { TelephonyEngineController } from '../../controller/TelephonyEngineController';
import { ITelephonyAccountDelegate } from '../ITelephonyAccountDelegate';
import { TELEPHONY_ACCOUNT_STATE } from '../../types';

jest.mock('../../controller/TelephonyEngineController');
jest.mock('../../controller/TelephonyAccountController');

describe('TelephonyService', () => {
  let telephonyService: TelephonyService;
  let engineController: TelephonyEngineController;
  let accountController;

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
    };

    engineController.getAccountController = jest
      .fn()
      .mockReturnValue(accountController);
    Object.assign(telephonyService, {
      _telephonyEngineController: engineController,
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
    it('should call account controller to make call', () => {
      telephonyService.makeCall('123', null);
      expect(accountController.makeCall).toHaveBeenCalledWith('123', null);
    });
  });
  describe('hangUp', () => {
    it('should call account controller to hang up ', () => {
      telephonyService.hangUp('123');
      expect(accountController.hangUp).toHaveBeenCalledWith('123');
    });
  });
});
