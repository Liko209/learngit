/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-01 09:16:12
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyAccountController } from '../TelephonyAccountController';
import { ITelephonyAccountDelegate } from '../../service/ITelephonyAccountDelegate';
import {
  RTC_ACCOUNT_STATE,
  RTCAccount,
  RTCCall,
  RTCCallInfo,
  RTC_CALL_STATE,
} from 'voip/src';
import { TelephonyCallInfo, MAKE_CALL_ERROR_CODE } from '../../types';
import { TelephonyCallController } from '../TelephonyCallController';
import { MakeCallController } from '../../controller/MakeCallController';
import { ServiceLoader } from '../../../serviceLoader';
import { TelephonyUserConfig } from '../../config/TelephonyUserConfig';
import { GlobalConfigService } from '../../../config';

jest.mock('../TelephonyCallController');
jest.mock('voip/src');
jest.mock('../../controller/MakeCallController');
jest.mock('../../../rcInfo/service/RCInfoService');
jest.mock('../../../config');

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
  let rtcAccount: RTCAccount;
  let callController: TelephonyCallController;

  const callId = '123';
  const toNum = '123';

  function setup() {
    mockAcc = new MockAccount();

    rtcAccount = new RTCAccount(null);
    accountController = new TelephonyAccountController(
      { createAccount: jest.fn().mockReturnValue(rtcAccount) },
      mockAcc,
      null,
    );

    callController = new TelephonyCallController(null);

    Object.assign(accountController, {
      _telephonyCallDelegate: callController,
    });
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  describe('makeCall', () => {
    it('should return error when there is no sip prov', async () => {
      rtcAccount.getSipProvFlags = jest.fn().mockReturnValueOnce(null);
      const res = await accountController.makeCall(toNum);
      expect(res).toBe(MAKE_CALL_ERROR_CODE.VOIP_CALLING_SERVICE_UNAVAILABLE);
    });

    it('should return error when voip is country blocked', async () => {
      rtcAccount.getSipProvFlags = jest
        .fn()
        .mockReturnValueOnce({ voipCountryBlocked: true });
      const res = await accountController.makeCall(toNum);
      expect(res).toBe(MAKE_CALL_ERROR_CODE.THE_COUNTRY_BLOCKED_VOIP);
    });

    it('should return error when voip is disabled', async () => {
      rtcAccount.getSipProvFlags = jest.fn().mockReturnValueOnce({
        voipCountryBlocked: false,
        voipFeatureEnabled: false,
      });
      const res = await accountController.makeCall(toNum);
      expect(res).toBe(MAKE_CALL_ERROR_CODE.VOIP_CALLING_SERVICE_UNAVAILABLE);
    });

    it('should return error when tryMakecall failed', async () => {
      rtcAccount.getSipProvFlags = jest.fn().mockReturnValueOnce({
        voipCountryBlocked: false,
        voipFeatureEnabled: true,
      });
      const makeCallController = new MakeCallController();
      makeCallController.tryMakeCall = jest
        .fn()
        .mockReturnValue(MAKE_CALL_ERROR_CODE.N11_101);
      Object.assign(accountController, {
        _makeCallController: makeCallController,
      });
      const res = await accountController.makeCall(toNum);
      expect(res).toBe(MAKE_CALL_ERROR_CODE.N11_101);
    });
    it('should call rtc account to make call when there is no error', async () => {
      rtcAccount.getSipProvFlags = jest.fn().mockReturnValueOnce({
        voipCountryBlocked: false,
        voipFeatureEnabled: true,
      });
      const makeCallController = new MakeCallController();
      makeCallController.tryMakeCall = jest
        .fn()
        .mockReturnValue(MAKE_CALL_ERROR_CODE.NO_ERROR);
      Object.assign(accountController, {
        _makeCallController: makeCallController,
        _telephonyCallDelegate: undefined,
      });
      const res = await accountController.makeCall(toNum);
      expect(res).toBe(MAKE_CALL_ERROR_CODE.NO_ERROR);
      expect(rtcAccount.makeCall).toBeCalled();
    });

    it('should return error when there is an ongoing call', async () => {
      rtcAccount.getSipProvFlags = jest.fn().mockReturnValueOnce({
        voipCountryBlocked: false,
        voipFeatureEnabled: true,
      });
      const makeCallController = new MakeCallController();
      makeCallController.tryMakeCall = jest
        .fn()
        .mockReturnValue(MAKE_CALL_ERROR_CODE.NO_ERROR);
      Object.assign(accountController, {
        _makeCallController: makeCallController,
        _telephonyCallDelegate: {},
      });
      const res = await accountController.makeCall(toNum);
      expect(res).toBe(MAKE_CALL_ERROR_CODE.MAX_CALLS_REACHED);
    });
  });

  describe('logout', () => {
    it('should call rtcAccount to logout', () => {
      accountController.logout();
      expect(rtcAccount.logout).toBeCalled();
    });
  });

  describe('callStateChanged', () => {
    it('should call rtcAccount to logout when it is disposed and call count = 1', () => {
      const logoutCallback = jest.fn();
      Object.assign(accountController, {
        _logoutCallback: logoutCallback,
        _isDisposing: jest.fn().mockReturnValue(true),
      });
      rtcAccount.callCount = jest.fn().mockReturnValue(1);
      accountController.callStateChanged(callId, RTC_CALL_STATE.DISCONNECTED);
      expect(rtcAccount.logout).toBeCalled();
      expect(logoutCallback).toBeCalled();
    });
    it('should not call rtcAccount to logout when it is not disposed', () => {
      Object.assign(accountController, {
        _isDisposing: jest.fn().mockReturnValue(false),
      });
      accountController.callStateChanged(callId, RTC_CALL_STATE.DISCONNECTED);
      expect(rtcAccount.logout).not.toBeCalled();
    });
    it('should not call rtcAccount to logout when it is disposed but call count = 0', () => {
      const logoutCallback = jest.fn();
      Object.assign(accountController, {
        _logoutCallback: logoutCallback,
        _isDisposing: jest.fn().mockReturnValue(true),
      });
      rtcAccount.callCount = jest.fn().mockReturnValue(0);
      accountController.callStateChanged(callId, RTC_CALL_STATE.DISCONNECTED);
      expect(rtcAccount.logout).not.toBeCalled();
    });
    it('should not call rtcAccount to logout when call state is not disconnected', () => {
      accountController.callStateChanged(callId, RTC_CALL_STATE.CONNECTED);
      expect(rtcAccount.logout).not.toBeCalled();
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

  describe('answer', () => {
    it('should call controller to answer call', () => {
      jest.spyOn(callController, 'answer');
      accountController.answer(callId);
      expect(callController.answer).toBeCalled();
    });
  });

  describe('sendToVoiceMail', () => {
    it('should call controller to send call to voice mail', () => {
      jest.spyOn(callController, 'sendToVoiceMail');
      accountController.sendToVoiceMail(callId);
      expect(callController.sendToVoiceMail).toBeCalled();
    });
  });

  describe('ignore', () => {
    it('should call controller to ignore call', () => {
      jest.spyOn(callController, 'ignore');
      accountController.ignore(callId);
      expect(callController.ignore).toBeCalled();
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

    it('should return when users have no calling permission', async () => {
      ServiceLoader.getInstance = jest.fn().mockReturnValueOnce({
        isRCFeaturePermissionEnabled: jest.fn().mockReturnValue(false),
      });
      const spy = jest.spyOn(accountController, '_checkVoipStatus');
      await accountController.onReceiveIncomingCall(null);
      expect(spy).not.toBeCalled();
    });

    it('should return when voip status is unavailable', async () => {
      ServiceLoader.getInstance = jest.fn().mockReturnValueOnce({
        isRCFeaturePermissionEnabled: jest.fn().mockReturnValue(true),
      });
      jest
        .spyOn(accountController, '_checkVoipStatus')
        .mockReturnValueOnce(MAKE_CALL_ERROR_CODE.THE_COUNTRY_BLOCKED_VOIP);
      spyOn(mockAcc, 'onReceiveIncomingCall');
      await accountController.onReceiveIncomingCall(null);
      expect(mockAcc.onReceiveIncomingCall).not.toBeCalled();
    });

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

      ServiceLoader.getInstance = jest.fn().mockReturnValueOnce({
        isRCFeaturePermissionEnabled: jest.fn().mockReturnValue(true),
      });
      jest
        .spyOn(accountController, '_checkVoipStatus')
        .mockReturnValueOnce(MAKE_CALL_ERROR_CODE.NO_ERROR);
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

  describe('getLastCalledNumber', () => {
    it('should return last called number when there is any', () => {
      TelephonyUserConfig.prototype.getLastCalledNumber = jest
        .fn()
        .mockReturnValueOnce('test');
      const result = accountController.getLastCalledNumber();
      expect(result).toBe('test');
    });
  });

  describe('setLastCalledNumber', () => {
    it('should call telephony to set last called number', () => {
      const lastCalled = jest.fn();
      TelephonyUserConfig.prototype.setLastCalledNumber = lastCalled;
      accountController.setLastCalledNumber('test');
      expect(lastCalled).toBeCalledWith('test');
    });
  });
});
