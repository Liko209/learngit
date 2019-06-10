/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-01 09:16:12
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyAccountController } from '../TelephonyAccountController';
import { ITelephonyAccountDelegate } from '../../service/ITelephonyAccountDelegate';
import { ITelephonyCallDelegate } from '../../service/ITelephonyCallDelegate';
import {
  RTC_ACCOUNT_STATE,
  RTCAccount,
  RTCCall,
  RTCCallInfo,
  RTC_CALL_STATE,
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
} from 'voip/src';
import { TelephonyCallInfo, MAKE_CALL_ERROR_CODE } from '../../types';
import { TelephonyCallController } from '../TelephonyCallController';
import { MakeCallController } from '../../controller/MakeCallController';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { TelephonyUserConfig } from '../../config/TelephonyUserConfig';
import { GlobalConfigService } from '../../../config';
import { RTC_CALL_ACTION, RTCCallActionSuccessOptions } from 'voip';

jest.mock('../TelephonyCallController');
jest.mock('voip/src');
jest.mock('../../controller/MakeCallController');
jest.mock('sdk/module/rcInfo/service/RCInfoService');
jest.mock('../../../config');
jest.mock('sdk/module/phoneNumber');

describe('TelephonyAccountController', () => {
  class MockAccount implements ITelephonyAccountDelegate {
    onAccountStateChanged(state: RTC_ACCOUNT_STATE) {}
    onMadeOutgoingCall(callId: string) {}
    onReceiveIncomingCall(callInfo: TelephonyCallInfo) {}
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

  let mockAcc;
  let mockCall;
  let accountController: TelephonyAccountController;
  let rtcAccount: RTCAccount;
  let callController: TelephonyCallController;

  const callId = '123';
  const toNum = '123';

  function setup() {
    mockAcc = new MockAccount();
    mockCall = new MockCall();

    rtcAccount = new RTCAccount(null);
    accountController = new TelephonyAccountController(
      { createAccount: jest.fn().mockReturnValue(rtcAccount) },
      mockAcc,
      mockCall,
    );

    callController = new TelephonyCallController(null);

    Object.assign(accountController, {
      _telephonyCallDelegate: callController,
    });
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.TELEPHONY_SERVICE) {
          return { userConfig: TelephonyUserConfig.prototype };
        }
        if (config === ServiceConfig.PHONE_NUMBER_SERVICE) {
          return {
            getE164PhoneNumber: jest.fn().mockReturnValue(toNum),
            isValidNumber: jest.fn().mockReturnValue(true),
          };
        }
      });
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  describe('makeCall', () => {
    let makeCallController: MakeCallController;
    beforeEach(() => {
      makeCallController = new MakeCallController();
      Object.assign(accountController, {
        _makeCallController: makeCallController,
      });
      accountController.setLastCalledNumber = jest.fn();
    });

    it('should return error when there is no sip prov', async () => {
      const spy = jest.spyOn(mockCall, 'onCallStateChange');
      rtcAccount.getSipProvFlags = jest.fn().mockReturnValueOnce(null);
      const res = await accountController.makeCall(toNum);
      expect(res).toBe(MAKE_CALL_ERROR_CODE.VOIP_CALLING_SERVICE_UNAVAILABLE);
      expect(spy).toBeCalledWith('', RTC_CALL_STATE.DISCONNECTED);
    });

    it('should return error when voip is country blocked', async () => {
      const spy = jest.spyOn(mockCall, 'onCallStateChange');
      rtcAccount.getSipProvFlags = jest
        .fn()
        .mockReturnValueOnce({ voipCountryBlocked: true });
      const res = await accountController.makeCall(toNum);
      expect(res).toBe(MAKE_CALL_ERROR_CODE.THE_COUNTRY_BLOCKED_VOIP);
      expect(spy).toBeCalledWith('', RTC_CALL_STATE.DISCONNECTED);
    });

    it('should return error when voip is disabled', async () => {
      const spy = jest.spyOn(mockCall, 'onCallStateChange');
      rtcAccount.getSipProvFlags = jest.fn().mockReturnValueOnce({
        voipCountryBlocked: false,
        voipFeatureEnabled: false,
      });
      const res = await accountController.makeCall(toNum);
      expect(res).toBe(MAKE_CALL_ERROR_CODE.VOIP_CALLING_SERVICE_UNAVAILABLE);
      expect(spy).toBeCalledWith('', RTC_CALL_STATE.DISCONNECTED);
    });

    it('should return error when tryMakecall failed', async () => {
      const spy = jest.spyOn(mockCall, 'onCallStateChange');
      rtcAccount.getSipProvFlags = jest.fn().mockReturnValueOnce({
        voipCountryBlocked: false,
        voipFeatureEnabled: true,
      });

      makeCallController.tryMakeCall = jest
        .fn()
        .mockReturnValue(MAKE_CALL_ERROR_CODE.N11_101);

      const res = await accountController.makeCall(toNum);
      expect(res).toBe(MAKE_CALL_ERROR_CODE.N11_101);
      expect(spy).toBeCalledWith('', RTC_CALL_STATE.DISCONNECTED);
    });

    it('should call rtc account to make call when there is no error', async () => {
      rtcAccount.getSipProvFlags = jest.fn().mockReturnValueOnce({
        voipCountryBlocked: false,
        voipFeatureEnabled: true,
      });
      makeCallController.tryMakeCall = jest
        .fn()
        .mockReturnValue(MAKE_CALL_ERROR_CODE.NO_ERROR);
      Object.assign(accountController, {
        _makeCallController: makeCallController,
        _telephonyCallDelegate: undefined,
      });
      const res = await accountController.makeCall(toNum);
      // expect(res).toBe(MAKE_CALL_ERROR_CODE.NO_ERROR);
      expect(rtcAccount.makeCall).toBeCalled();
    });

    it('should return error when rtc make call fail', async () => {
      const spy = jest.spyOn(mockCall, 'onCallStateChange');
      rtcAccount.getSipProvFlags = jest.fn().mockReturnValueOnce({
        voipCountryBlocked: false,
        voipFeatureEnabled: true,
      });

      makeCallController.tryMakeCall = jest
        .fn()
        .mockReturnValue(MAKE_CALL_ERROR_CODE.NO_ERROR);
      Object.assign(accountController, {
        _makeCallController: makeCallController,
        _telephonyCallDelegate: undefined,
      });
      jest.spyOn(rtcAccount, 'makeCall').mockReturnValueOnce(null);
      const res = await accountController.makeCall(toNum);
      expect(res).toBe(MAKE_CALL_ERROR_CODE.VOIP_CALLING_SERVICE_UNAVAILABLE);
      expect(rtcAccount.makeCall).toBeCalled();
      expect(spy).toBeCalledWith('', RTC_CALL_STATE.DISCONNECTED);
    });

    it('should return error when there is an ongoing call', async () => {
      rtcAccount.getSipProvFlags = jest.fn().mockReturnValueOnce({
        voipCountryBlocked: false,
        voipFeatureEnabled: true,
      });

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

  describe('startReply', () => {
    it('should call controller to startReply', () => {
      jest.spyOn(callController, 'startReply');
      accountController.startReply(callId);
      expect(callController.startReply).toBeCalled();
    });
  });

  describe('ignore', () => {
    it('should call controller to ignore call', () => {
      jest.spyOn(callController, 'ignore');
      accountController.ignore(callId);
      expect(callController.ignore).toBeCalled();
    });
  });

  describe('replyWithMessage', () => {
    it('should call controller to reply with message', () => {
      jest.spyOn(callController, 'replyWithMessage');
      accountController.replyWithMessage('', '');
      expect(callController.replyWithMessage).toBeCalled();
    });
  });

  describe('replyWithPattern', () => {
    it('should call controller to reply with pattern', () => {
      jest.spyOn(callController, 'replyWithPattern');
      accountController.replyWithPattern(
        callId,
        RTC_REPLY_MSG_PATTERN.CALL_ME_BACK_LATER,
        0,
        RTC_REPLY_MSG_TIME_UNIT.DAY,
      );
      expect(callController.replyWithPattern).toBeCalled();
    });
  });

  describe('onMadeOutgoingCall', () => {
    it('should pass call created event to delegate', () => {
      spyOn(mockAcc, 'onMadeOutgoingCall');
      jest.spyOn(callController, 'getEntityId').mockReturnValue(1);
      accountController.onMadeOutgoingCall({
        getCallInfo: jest.fn().mockReturnValue({ uuid: '123' }),
      });
      expect(callController.setRtcCall).toBeCalled();
      expect(mockAcc.onMadeOutgoingCall).toBeCalledWith(1);
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

      TelephonyCallController.prototype.getEntityId = jest
        .fn()
        .mockReturnValue(1);

      ServiceLoader.getInstance = jest.fn().mockReturnValueOnce({
        isRCFeaturePermissionEnabled: jest.fn().mockReturnValue(true),
      });
      jest
        .spyOn(accountController, '_checkVoipStatus')
        .mockReturnValueOnce(MAKE_CALL_ERROR_CODE.NO_ERROR);
      spyOn(mockAcc, 'onReceiveIncomingCall');

      await accountController.onReceiveIncomingCall(rtcCall);
      expect(mockAcc.onReceiveIncomingCall).toBeCalledWith(1);
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

    it('should return empty string when there is no last called number', () => {
      TelephonyUserConfig.prototype.getLastCalledNumber = jest
        .fn()
        .mockReturnValueOnce(null);
      const result = accountController.getLastCalledNumber();
      expect(result).toBe('');
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
