/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-01 09:16:12
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyAccountController } from '../TelephonyAccountController';
import { ITelephonyAccountDelegate } from '../../service/ITelephonyAccountDelegate';
import { RTC_ACCOUNT_STATE, RTCAccount, RTCCall, RTCCallInfo } from 'voip/src';
import { TelephonyCallInfo } from '../../types';
import { PersonService } from '../../../person';

describe('TelephonyAccountController', () => {
  class MockAccount implements ITelephonyAccountDelegate {
    onAccountStateChanged(state: RTC_ACCOUNT_STATE) {}
    onMadeOutgoingCall(callId: string) {}
    onReceiveIncomingCall(callInfo: TelephonyCallInfo) {}
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
      logout: jest.fn(),
    }; // new RTCAccount(null);
    accountController = new TelephonyAccountController(
      { createAccount: jest.fn().mockReturnValue(rtcAccount) },
      mockAcc,
      null,
    );
    callController = {
      hangUp: jest.fn(),
      mute: jest.fn(),
      unmute: jest.fn(),
      setRtcCall: jest.fn(),
    };

    Object.assign(accountController, {
      _telephonyCallDelegate: callController,
    });
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  describe('makeCall', () => {
    it('should call rtcAccount to make call', () => {
      accountController.makeCall('123');
      expect(rtcAccount.makeCall).toBeCalled();
    });
  });

  describe('logout', () => {
    it('should call rtcAccount to logout', () => {
      accountController.logout();
      expect(rtcAccount.logout).toBeCalled();
    });
  });

  describe('hangUp', () => {
    it('should call controller to hang up', () => {
      jest.spyOn(callController, 'hangUp');
      accountController.hangUp('123');
      expect(callController.hangUp).toBeCalled();
    });
  });

  describe('mute', () => {
    it('should call controller to mute', () => {
      jest.spyOn(callController, 'mute');
      accountController.mute('123');
      expect(callController.mute).toBeCalled();
    });
  });

  describe('unmute', () => {
    it('should call controller to unmute', () => {
      jest.spyOn(callController, 'unmute');
      accountController.unmute('123');
      expect(callController.unmute).toBeCalled();
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

  describe('onReceiveIncomingCall', () => {
    const NUM = '123';
    const NAME = 'test';
    const CALL_ID = '789';
    it('should call incoming call delegate when there is an incoming call', async () => {
      const rtcCall = new RTCCall(false, '', null, null);
      rtcCall.getCallInfo = jest.fn().mockReturnValue({
        fromName: NAME,
        fromNum: NUM,
        toName: '',
        toNum: '',
        uuid: CALL_ID,
        partyId: '',
        sessionId: '',
      });

      spyOn(mockAcc, 'onReceiveIncomingCall');

      await accountController.onReceiveIncomingCall(rtcCall);
      expect(mockAcc.onReceiveIncomingCall).toBeCalledWith({
        fromName: NAME,
        fromNum: NUM,
        toNum: '',
        callId: CALL_ID,
      });
    });
  });
});
