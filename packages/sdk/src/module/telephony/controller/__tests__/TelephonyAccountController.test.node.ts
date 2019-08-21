/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-01 09:16:12
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyAccountController } from '../TelephonyAccountController';
import { ITelephonyDelegate } from '../../service/ITelephonyDelegate';
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
import { MAKE_CALL_ERROR_CODE } from '../../types';
import { TelephonyCallController } from '../TelephonyCallController';
import { MakeCallController } from '../MakeCallController';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { TelephonyUserConfig } from '../../config/TelephonyUserConfig';
import { GlobalConfigService } from '../../../config';
import { RTC_CALL_ACTION, RTCCallActionSuccessOptions } from 'voip';
import { RTC_SLEEP_MODE_EVENT } from 'voip/src/utils/types';
import { ActiveCall } from 'sdk/module/rcEventSubscription/types';
import { RCInfoService } from 'sdk/module/rcInfo';
import { E911Controller } from '../E911Controller';

jest.mock('../E911Controller');
jest.mock('../TelephonyCallController');
jest.mock('voip/src');
jest.mock('../../controller/MakeCallController');
jest.mock('sdk/module/rcInfo/service/RCInfoService');
jest.mock('../../../config');
jest.mock('sdk/module/phoneNumber');

describe('TelephonyAccountController', () => {
  class MockAccount implements ITelephonyDelegate {
    onMadeOutgoingCall(callId: number) {}
    onReceiveIncomingCall(callId: number) {}
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
  let callControllerList: Map<number, TelephonyCallController>;
  let e911Controller: E911Controller;
  const callId = 123;
  const toNum = '123';
  const fromNumber = '456';

  function setup() {
    mockAcc = new MockAccount();
    mockCall = new MockCall();
    callControllerList = new Map();
    e911Controller = new E911Controller({});

    rtcAccount = new RTCAccount(null);
    accountController = new TelephonyAccountController({
      createAccount: jest.fn().mockReturnValue(rtcAccount),
    });

    Object.assign(accountController, {
      _callControllerList: callControllerList,
      _e911Controller: e911Controller,
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

  describe('switchCall', () => {
    let makeCallController: MakeCallController;
    const myNumber = '113';
    beforeEach(() => {
      makeCallController = new MakeCallController();
      Object.assign(accountController, {
        _makeCallController: makeCallController,
      });
      accountController.setLastCalledNumber = jest.fn();
    });

    it('should pass expected parameter to _makeCallInternal when is outbound call', async () => {
      const activeCall = {
        direction: 'Outbound',
        from: '21010',
        fromName: 'Florence Connelly',
        id: '8ec28384e8d54846beafae947febdaa9',
        sipData: {
          fromTag: '10.74.2.219-5070-285e39746afa4a2',
          toTag: 'k6rqhp560h',
        },
        to: '21007',
        toName: 'Yilia Hong',
      };
      accountController['_makeCallInternal'] = jest
        .fn()
        .mockResolvedValue(MAKE_CALL_ERROR_CODE.NO_ERROR);
      const result = await accountController.switchCall(
        myNumber,
        activeCall as ActiveCall,
      );
      expect(result).toEqual(MAKE_CALL_ERROR_CODE.NO_ERROR);
      expect(accountController['_makeCallInternal']).toHaveBeenCalledWith(
        '113',
        true,
        {
          replaceName: 'Yilia Hong',
          replaceNumber: '21007',
          replacesCallId: '8ec28384e8d54846beafae947febdaa9',
          replacesFromTag: '10.74.2.219-5070-285e39746afa4a2',
          replacesToTag: 'k6rqhp560h',
          callDirection: 'Outbound',
        },
      );
    });

    it('should pass expected parameter to _makeCallInternal when is inbound call', async () => {
      const activeCall = {
        direction: 'Inbound',
        from: '21010',
        fromName: 'Florence Connelly',
        id: '8ec28384e8d54846beafae947febdaa9',
        sipData: {
          fromTag: '10.74.2.219-5070-285e39746afa4a2',
          toTag: 'k6rqhp560h',
        },
        to: '21007',
        toName: 'Yilia Hong',
      };
      accountController['_makeCallInternal'] = jest
        .fn()
        .mockResolvedValue(MAKE_CALL_ERROR_CODE.NO_ERROR);
      const result = await accountController.switchCall(
        myNumber,
        activeCall as ActiveCall,
      );
      expect(result).toEqual(MAKE_CALL_ERROR_CODE.NO_ERROR);
      expect(accountController['_makeCallInternal']).toHaveBeenCalledWith(
        '113',
        true,
        {
          replaceName: 'Florence Connelly',
          replaceNumber: '21010',
          replacesCallId: '8ec28384e8d54846beafae947febdaa9',
          replacesFromTag: '10.74.2.219-5070-285e39746afa4a2',
          replacesToTag: 'k6rqhp560h',
          callDirection: 'Inbound',
        },
      );
    });
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
      const res = await accountController.makeCall(toNum, { fromNumber });
      expect(res).toBe(MAKE_CALL_ERROR_CODE.VOIP_CALLING_SERVICE_UNAVAILABLE);
    });

    it('should return error when voip is country blocked [JPT-2382]', async () => {
      const spy = jest.spyOn(mockCall, 'onCallStateChange');
      rtcAccount.getSipProvFlags = jest
        .fn()
        .mockReturnValueOnce({ voipCountryBlocked: true });
      const res = await accountController.makeCall(toNum, { fromNumber });
      expect(res).toBe(MAKE_CALL_ERROR_CODE.THE_COUNTRY_BLOCKED_VOIP);
    });

    it('should return error when voip is disabled [JPT-2383]', async () => {
      const spy = jest.spyOn(mockCall, 'onCallStateChange');
      rtcAccount.getSipProvFlags = jest.fn().mockReturnValueOnce({
        voipCountryBlocked: false,
        voipFeatureEnabled: false,
      });
      const res = await accountController.makeCall(toNum, { fromNumber });
      expect(res).toBe(MAKE_CALL_ERROR_CODE.VOIP_CALLING_SERVICE_UNAVAILABLE);
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
      accountController.onAccountStateChanged(RTC_ACCOUNT_STATE.REGISTERED);
      const res = await accountController.makeCall(toNum, { fromNumber });
      expect(res).toBe(MAKE_CALL_ERROR_CODE.N11_101);
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
      accountController.onAccountStateChanged(RTC_ACCOUNT_STATE.REGISTERED);
      rtcAccount.makeCall = jest.fn().mockReturnValue({
        setCallDelegate: jest.fn(),
      });
      const res = await accountController.makeCall(toNum, { fromNumber });
      expect(res).toBe(MAKE_CALL_ERROR_CODE.NO_ERROR);
      expect(rtcAccount.makeCall).toHaveBeenCalled();
      expect(callControllerList.size).toBe(1);
    });

    it('should start a call with access code', async () => {
      const code = '123456';
      rtcAccount.getSipProvFlags = jest.fn().mockReturnValueOnce({
        voipCountryBlocked: false,
        voipFeatureEnabled: true,
      });
      makeCallController.tryMakeCall = jest
        .fn()
        .mockReturnValue(MAKE_CALL_ERROR_CODE.NO_ERROR);
      await accountController.makeCall(toNum, { accessCode: code });
      expect(rtcAccount.makeCall).toHaveBeenCalledWith(
        toNum,
        expect.any(Object),
        { accessCode: code },
      );
    });

    it('should return error when rtc make call fail', async () => {
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
      accountController.onAccountStateChanged(RTC_ACCOUNT_STATE.REGISTERED);
      rtcAccount.makeCall = jest.fn().mockReturnValue(null);
      const res = await accountController.makeCall(toNum, { fromNumber });
      expect(res).toBe(MAKE_CALL_ERROR_CODE.VOIP_CALLING_SERVICE_UNAVAILABLE);
      expect(rtcAccount.makeCall).toHaveBeenCalled();
      expect(callControllerList.size).toBe(0);
    });
  });

  describe('logout', () => {
    it('should call rtcAccount to logout', () => {
      accountController.logout();
      expect(rtcAccount.logout).toHaveBeenCalled();
    });
  });

  describe('getCallIdList', () => {
    it('should return call id list', () => {
      callControllerList.clear();
      callControllerList.set(1, {});
      callControllerList.set(2, {});
      const res = accountController.getCallIdList();
      expect(res).toEqual([1, 2]);
    });
  });

  describe('_processLogoutIfNeeded', () => {
    it('should call rtcAccount to logout when it is disposed and call count = 1', () => {
      const logoutCallback = jest.fn();
      Object.assign(accountController, {
        _logoutCallback: logoutCallback,
        _isDisposing: jest.fn().mockReturnValue(true),
      });
      rtcAccount.callCount = jest.fn().mockReturnValue(1);
      accountController._processLogoutIfNeeded();
      expect(rtcAccount.logout).toHaveBeenCalled();
      expect(logoutCallback).toHaveBeenCalled();
    });
    it('should not call rtcAccount to logout when it is not disposed', () => {
      Object.assign(accountController, {
        _isDisposing: jest.fn().mockReturnValue(false),
      });
      accountController._processLogoutIfNeeded();
      expect(rtcAccount.logout).not.toHaveBeenCalled();
    });
    it('should not call rtcAccount to logout when it is disposed but call count = 0', () => {
      const logoutCallback = jest.fn();
      Object.assign(accountController, {
        _logoutCallback: logoutCallback,
        _isDisposing: jest.fn().mockReturnValue(true),
      });
      rtcAccount.callCount = jest.fn().mockReturnValue(0);
      accountController._processLogoutIfNeeded();
      expect(rtcAccount.logout).not.toHaveBeenCalled();
    });
    it('should not call rtcAccount to logout when call state is not disconnected', () => {
      accountController._processLogoutIfNeeded();
      expect(rtcAccount.logout).not.toHaveBeenCalled();
    });
  });

  describe('getRemoteEmergencyAddress', () => {
    it('should return undefined when no emergency addr', () => {
      e911Controller.getRemoteEmergencyAddress = jest
        .fn()
        .mockReturnValue('test');
      const res = accountController.getRemoteEmergencyAddress();
      expect(res).toBe('test');
    });
  });

  describe('isAddressEqual', () => {
    it('should call with correct parameters', () => {
      const addr1 = { a: 'a' };
      const addr2 = { b: 'b' };
      e911Controller.isAddressEqual = jest.fn().mockReturnValue(true);
      const res = accountController.isAddressEqual(addr1, addr2);
      expect(e911Controller.isAddressEqual).toHaveBeenCalledWith(addr1, addr2);
      expect(res).toBeTruthy();
    });
  });

  describe('getSipProv', () => {
    it('should return sip prov from rtc account', () => {
      rtcAccount.getSipProv = jest.fn();
      accountController.getSipProv();
      expect(rtcAccount.getSipProv).toHaveBeenCalled();
    });
  });

  describe('getWebPhoneId', () => {
    it('should not get web phone id when there is no sip prov', () => {
      rtcAccount.getSipProv = jest.fn().mockReturnValue(null);
      const res = accountController.getWebPhoneId();
      expect(res).toBe(undefined);
    });
    it('should return web phone id when sip prov is ready', () => {
      rtcAccount.getSipProv = jest.fn().mockReturnValue({ device: { id: 12 } });
      const res = accountController.getWebPhoneId();
      expect(res).toBe(12);
    });
  });

  describe('hangUp', () => {
    it('should call controller to hang up', () => {
      const callController = {
        hangUp: jest.fn(),
      };
      accountController._addControllerToList(callId, callController);
      accountController.hangUp(callId);
      expect(callController.hangUp).toHaveBeenCalled();
    });
  });

  describe('mute', () => {
    it('should call controller to mute', () => {
      const callController = {
        mute: jest.fn(),
      };
      accountController._addControllerToList(callId, callController);
      accountController.mute(callId);
      expect(callController.mute).toHaveBeenCalled();
    });
  });

  describe('unmute', () => {
    it('should call controller to unmute', () => {
      const callController = {
        unmute: jest.fn(),
      };
      accountController._addControllerToList(callId, callController);
      accountController.unmute(callId);
      expect(callController.unmute).toHaveBeenCalled();
    });
  });

  describe('answer', () => {
    it('should call controller to answer call', () => {
      const callController = {
        answer: jest.fn(),
      };
      accountController._addControllerToList(callId, callController);
      accountController.answer(callId);
      expect(callController.answer).toHaveBeenCalled();
    });
  });

  describe('sendToVoiceMail', () => {
    it('should call controller to send call to voice mail', () => {
      const callController = {
        sendToVoiceMail: jest.fn(),
      };
      accountController._addControllerToList(callId, callController);
      accountController.sendToVoiceMail(callId);
      expect(callController.sendToVoiceMail).toHaveBeenCalled();
    });
  });

  describe('startReply', () => {
    it('should call controller to startReply', () => {
      const callController = {
        startReply: jest.fn(),
      };
      accountController._addControllerToList(callId, callController);
      accountController.startReply(callId);
      expect(callController.startReply).toHaveBeenCalled();
    });
  });

  describe('ignore', () => {
    it('should call controller to ignore call', () => {
      const callController = {
        ignore: jest.fn(),
      };
      accountController._addControllerToList(callId, callController);
      accountController.ignore(callId);
      expect(callController.ignore).toHaveBeenCalled();
    });
  });

  describe('replyWithMessage', () => {
    it('should call controller to reply with message', () => {
      const callController = {
        replyWithMessage: jest.fn(),
      };
      accountController._addControllerToList(callId, callController);
      accountController.replyWithMessage(callId, '');
      expect(callController.replyWithMessage).toHaveBeenCalled();
    });
  });

  describe('replyWithPattern', () => {
    it('should call controller to reply with pattern', () => {
      const callController = {
        replyWithPattern: jest.fn(),
      };
      accountController._addControllerToList(callId, callController);
      accountController.replyWithPattern(
        callId,
        RTC_REPLY_MSG_PATTERN.CALL_ME_BACK_LATER,
        0,
        RTC_REPLY_MSG_TIME_UNIT.DAY,
      );
      expect(callController.replyWithPattern).toHaveBeenCalled();
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
      expect(spy).not.toHaveBeenCalled();
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
      expect(mockAcc.onReceiveIncomingCall).not.toHaveBeenCalled();
    });

    it('should return when call is disconnected before notifying UX', async () => {
      ServiceLoader.getInstance = jest.fn().mockReturnValueOnce({
        isRCFeaturePermissionEnabled: jest.fn().mockReturnValue(true),
      });
      accountController._checkVoipStatus = jest
        .fn()
        .mockReturnValue(MAKE_CALL_ERROR_CODE.NO_ERROR);
      spyOn(mockAcc, 'onReceiveIncomingCall');
      const call = new RTCCall();
      call.getCallState = jest
        .fn()
        .mockReturnValue(RTC_CALL_STATE.DISCONNECTED);
      call.getCallInfo = jest.fn().mockReturnValue({
        uuid: 'test',
      });
      await accountController.onReceiveIncomingCall(call);
      expect(mockAcc.onReceiveIncomingCall).not.toHaveBeenCalled();
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

      accountController.setAccountDelegate(mockAcc);
      await accountController.onReceiveIncomingCall(rtcCall);
      expect(mockAcc.onReceiveIncomingCall).toHaveBeenCalledWith(1);
      expect(callControllerList.size).toBe(1);
    });
  });

  describe('setLastCalledNumber', () => {
    it('should call telephony to set last called number', () => {
      const lastCalled = jest.fn();
      TelephonyUserConfig.prototype.setLastCalledNumber = lastCalled;
      accountController.setLastCalledNumber('test');
      expect(lastCalled).toHaveBeenCalledWith('test');
    });
  });

  describe('getVoipState', () => {
    it('should call rtc to get voip state', () => {
      const spy = jest.spyOn(rtcAccount, 'state');
      accountController.getVoipState();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('_addControllerToList', () => {
    it('should add controller to list', () => {
      const spy = jest.spyOn(callControllerList, 'set');
      accountController._addControllerToList(callId, {});
      expect(spy).toHaveBeenCalledWith(callId, {});
    });
  });

  describe('_removeControllerFromList', () => {
    it('should remove controller from list', () => {
      const spy = jest.spyOn(callControllerList, 'delete');
      accountController._removeControllerFromList(callId);
      expect(spy).toHaveBeenCalledWith(callId);
    });
  });
});
