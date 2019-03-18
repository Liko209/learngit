/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-01 09:16:12
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyAccountController } from '../TelephonyAccountController';
import { ITelephonyAccountDelegate } from '../../service/ITelephonyAccountDelegate';
import { RTC_ACCOUNT_STATE, RTCAccount } from 'voip/src';

describe('TelephonyAccountController', () => {
  class MockAccount implements ITelephonyAccountDelegate {
    onAccountStateChanged(state: RTC_ACCOUNT_STATE) {}
    onMadeOutgoingCall(callId: string) {}
  }

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  }

  let mockAcc;
  let accountController: TelephonyAccountController;
  let rtcAccount;
  let callController;

  function setup() {
    mockAcc = new MockAccount();

    rtcAccount = {
      handleProvisioning: jest.fn(),
      makeCall: jest.fn(),
    }; // new RTCAccount(null);
    accountController = new TelephonyAccountController(
      { createAccount: jest.fn().mockReturnValue(rtcAccount) },
      mockAcc,
    );
    callController = {
      hangUp: jest.fn(),
      setRtcCall: jest.fn(),
    };

    Object.assign(accountController, {
      _callController: callController,
    });
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  describe('makeCall', () => {
    it('should call rtcAccount to make call', () => {
      accountController.makeCall('123', null);
      expect(rtcAccount.makeCall).toBeCalled();
    });
  });
  describe('hangUp', () => {
    it('should call controller to hang up', () => {
      jest.spyOn(callController, 'hangUp');
      accountController.hangUp('123');
      expect(callController.hangUp).toBeCalled();
    });
  });

  describe('onMadeOutgoingCall', () => {
    it('should pass call created event to delegate', () => {
      spyOn(mockAcc, 'onMadeOutgoingCall');
      accountController.onMadeOutgoingCall({
        getCallInfo: jest.fn().mockReturnValue({ uuid: '123' }),
      });
      expect(callController.setRtcCall).toBeCalled();
      expect(mockAcc.onMadeOutgoingCall).toBeCalledWith('123');
    });
  });

  describe('onAccountStateChanged', () => {
    it('should pass idle state to controller', () => {
      spyOn(mockAcc, 'onAccountStateChanged');
      accountController.onAccountStateChanged(RTC_ACCOUNT_STATE.IDLE);
      expect(mockAcc.onAccountStateChanged).toBeCalledWith(
        RTC_ACCOUNT_STATE.IDLE,
      );
    });

    it('should pass failed state to controller', () => {
      spyOn(mockAcc, 'onAccountStateChanged');
      accountController.onAccountStateChanged(RTC_ACCOUNT_STATE.FAILED);
      expect(mockAcc.onAccountStateChanged).toBeCalledWith(
        RTC_ACCOUNT_STATE.FAILED,
      );
    });

    it('should pass inProgress state to controller', () => {
      spyOn(mockAcc, 'onAccountStateChanged');
      accountController.onAccountStateChanged(RTC_ACCOUNT_STATE.IN_PROGRESS);
      expect(mockAcc.onAccountStateChanged).toBeCalledWith(
        RTC_ACCOUNT_STATE.IN_PROGRESS,
      );
    });

    it('should pass registered state to controller', () => {
      spyOn(mockAcc, 'onAccountStateChanged');
      accountController.onAccountStateChanged(RTC_ACCOUNT_STATE.REGISTERED);
      expect(mockAcc.onAccountStateChanged).toBeCalledWith(
        RTC_ACCOUNT_STATE.REGISTERED,
      );
    });

    it('should pass unregistered state to controller', () => {
      spyOn(mockAcc, 'onAccountStateChanged');
      accountController.onAccountStateChanged(RTC_ACCOUNT_STATE.UNREGISTERED);
      expect(mockAcc.onAccountStateChanged).toBeCalledWith(
        RTC_ACCOUNT_STATE.UNREGISTERED,
      );
    });
  });
});
