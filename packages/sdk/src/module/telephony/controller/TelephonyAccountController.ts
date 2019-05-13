/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 08:59:49
 * Copyright © RingCentral. All rights reserved.
 */
import {
  RTCEngine,
  RTCAccount,
  IRTCAccountDelegate,
  RTC_ACCOUNT_STATE,
  RTCCall,
  RTCSipFlags,
  RTCCallInfo,
  RTC_STATUS_CODE,
  RTC_CALL_STATE,
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
} from 'voip';
import { TelephonyCallController } from '../controller/TelephonyCallController';
import { ITelephonyCallDelegate } from '../service/ITelephonyCallDelegate';
import { ITelephonyAccountDelegate } from '../service/ITelephonyAccountDelegate';
import {
  TelephonyCallInfo,
  MAKE_CALL_ERROR_CODE,
  LogoutCallback,
} from '../types';
import { telephonyLogger } from 'foundation';
import { MakeCallController } from './MakeCallController';
import { RCInfoService } from '../../rcInfo';
import { ERCServiceFeaturePermission } from '../../rcInfo/types';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { TelephonyUserConfig } from '../config/TelephonyUserConfig';
import { PhoneNumberService } from 'sdk/module/phoneNumber';

class TelephonyAccountController implements IRTCAccountDelegate {
  private _telephonyAccountDelegate: ITelephonyAccountDelegate;
  private _telephonyCallDelegate: TelephonyCallController;
  private _rtcAccount: RTCAccount;
  private _callDelegate: ITelephonyCallDelegate;
  private _makeCallController: MakeCallController;
  private _isDisposing: boolean = false;
  private _logoutCallback: LogoutCallback;

  constructor(
    rtcEngine: RTCEngine,
    delegate: ITelephonyAccountDelegate,
    callDelegate: ITelephonyCallDelegate,
  ) {
    this._rtcAccount = rtcEngine.createAccount(this);
    this._telephonyAccountDelegate = delegate;
    this._rtcAccount.handleProvisioning();
    this._callDelegate = callDelegate;
    this._makeCallController = new MakeCallController();
  }

  private _checkVoipStatus(): MAKE_CALL_ERROR_CODE {
    let res = MAKE_CALL_ERROR_CODE.NO_ERROR;
    const sipProvFlag = this._rtcAccount.getSipProvFlags();

    do {
      if (!sipProvFlag) {
        res = MAKE_CALL_ERROR_CODE.VOIP_CALLING_SERVICE_UNAVAILABLE;
        telephonyLogger.warn('sip prov is not ready');
        break;
      }

      if (sipProvFlag.voipCountryBlocked) {
        telephonyLogger.warn('voip is country blocked');
        res = MAKE_CALL_ERROR_CODE.THE_COUNTRY_BLOCKED_VOIP;
        break;
      }

      if (!sipProvFlag.voipFeatureEnabled) {
        telephonyLogger.warn('voip feature is disabled');
        res = MAKE_CALL_ERROR_CODE.VOIP_CALLING_SERVICE_UNAVAILABLE;
        break;
      }
    } while (false);

    return res;
  }

  getLastCalledNumber() {
    const telephonyConfig = new TelephonyUserConfig();
    return telephonyConfig.getLastCalledNumber();
  }

  setLastCalledNumber(num: string) {
    const telephonyConfig = new TelephonyUserConfig();
    telephonyConfig.setLastCalledNumber(num);
  }

  async makeCall(toNumber: string, fromNum: string) {
    let result = this._checkVoipStatus();
    if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
      return result;
    }
    const phoneNumberService = ServiceLoader.getInstance<PhoneNumberService>(
      ServiceConfig.PHONE_NUMBER_SERVICE,
    );
    const e164ToNumber = await phoneNumberService.getE164PhoneNumber(toNumber);
    this.setLastCalledNumber(e164ToNumber);
    result = await this._makeCallController.tryMakeCall(e164ToNumber);
    if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
      return result;
    }
    if (this._telephonyCallDelegate) {
      return MAKE_CALL_ERROR_CODE.MAX_CALLS_REACHED;
    }
    this._telephonyCallDelegate = new TelephonyCallController(
      this._callDelegate,
    );
    this._telephonyCallDelegate.setCallStateCallback(this.callStateChanged);
    let makeCallResult: RTC_STATUS_CODE;
    if (fromNum) {
      makeCallResult = this._rtcAccount.makeCall(
        toNumber,
        this._telephonyCallDelegate,
        { fromNumber: fromNum },
      );
    } else {
      makeCallResult = this._rtcAccount.makeCall(
        toNumber,
        this._telephonyCallDelegate,
      );
    }
    switch (makeCallResult) {
      case RTC_STATUS_CODE.NUMBER_INVALID: {
        result = MAKE_CALL_ERROR_CODE.INVALID_PHONE_NUMBER;
        break;
      }
      case RTC_STATUS_CODE.MAX_CALLS_REACHED: {
        result = MAKE_CALL_ERROR_CODE.MAX_CALLS_REACHED;
        break;
      }
      case RTC_STATUS_CODE.INVALID_STATE: {
        result = MAKE_CALL_ERROR_CODE.INVALID_STATE;
        break;
      }
    }
    return result;
  }

  hangUp(callId: string) {
    // So far only need to support one call. By design, we should get call controller according callID.
    this._telephonyCallDelegate && this._telephonyCallDelegate.hangUp();
  }

  mute(callId: string) {
    this._telephonyCallDelegate && this._telephonyCallDelegate.mute();
  }

  unmute(callId: string) {
    this._telephonyCallDelegate && this._telephonyCallDelegate.unmute();
  }

  hold(callId: string) {
    this._telephonyCallDelegate && this._telephonyCallDelegate.hold();
  }

  unhold(callId: string) {
    this._telephonyCallDelegate && this._telephonyCallDelegate.unhold();
  }

  startRecord(callId: string) {
    this._telephonyCallDelegate && this._telephonyCallDelegate.startRecord();
  }

  stopRecord(callId: string) {
    this._telephonyCallDelegate && this._telephonyCallDelegate.stopRecord();
  }

  dtmf(callId: string, digits: string) {
    this._telephonyCallDelegate && this._telephonyCallDelegate.dtmf(digits);
  }

  answer(callId: string) {
    this._telephonyCallDelegate && this._telephonyCallDelegate.answer();
  }

  sendToVoiceMail(callId: string) {
    this._telephonyCallDelegate && this._telephonyCallDelegate.sendToVoiceMail();
  }

  ignore(callId: string) {
    this._telephonyCallDelegate && this._telephonyCallDelegate.ignore();
  }

  startReply(callId: string) {
    this._telephonyCallDelegate && this._telephonyCallDelegate.startReply();
  }

  replyWithMessage(callId: string, message: string) {
    this._telephonyCallDelegate && this._telephonyCallDelegate.replyWithMessage(message);
  }

  replyWithPattern(
    callId: string,
    pattern: RTC_REPLY_MSG_PATTERN,
    time: number,
    timeUnit: RTC_REPLY_MSG_TIME_UNIT,
  ) {
    this._telephonyCallDelegate && this._telephonyCallDelegate.replyWithPattern(pattern, time, timeUnit);
  }
  onAccountStateChanged(state: RTC_ACCOUNT_STATE) {
    this._telephonyAccountDelegate.onAccountStateChanged(state);
  }

  onMadeOutgoingCall(call: RTCCall) {
    this._telephonyCallDelegate.setRtcCall(call);
    this._telephonyAccountDelegate.onMadeOutgoingCall(call.getCallInfo().uuid);
  }

  private async _buildCallInfo(rtcCallInfo: RTCCallInfo) {
    const callInfo: TelephonyCallInfo = {
      fromNum: rtcCallInfo.fromNum,
      toNum: rtcCallInfo.toNum,
      callId: rtcCallInfo.uuid,
    };

    if (rtcCallInfo.fromName) {
      callInfo.fromName = rtcCallInfo.fromName;
    }

    if (rtcCallInfo.toName) {
      callInfo.toName = rtcCallInfo.toName;
    }

    return callInfo;
  }

  private async _shouldShowIncomingCall() {
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    let showCall = true;

    do {
      showCall = await rcInfoService.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.VOIP_CALLING,
      );

      if (!showCall) {
        telephonyLogger.warn('voip feature permission is not enabled');
        break;
      }

      // TODO E911 FIJI-4794

      // TODO Block incoming call FIJI-4800
    } while (false);

    return showCall;
  }

  async onReceiveIncomingCall(call: RTCCall) {
    const showCall = await this._shouldShowIncomingCall();
    if (!showCall) {
      return;
    }
    const result = this._checkVoipStatus();
    if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
      return;
    }
    this._telephonyCallDelegate = new TelephonyCallController(
      this._callDelegate,
    );
    this._telephonyCallDelegate.setRtcCall(call);
    this._telephonyCallDelegate.setCallStateCallback(this.callStateChanged);
    call.setCallDelegate(this._telephonyCallDelegate);
    const callInfo = await this._buildCallInfo(call.getCallInfo());
    this._telephonyAccountDelegate.onReceiveIncomingCall(callInfo);
  }

  getCallCount() {
    return this._rtcAccount.callCount();
  }

  onReceiveNewProvFlags(sipFlags: RTCSipFlags) {}

  private _processLogoutIfNeeded() {
    if (this._isDisposing && this._rtcAccount.callCount() === 1) {
      this._rtcAccount.logout();
      this._isDisposing = false;
      if (this._logoutCallback) {
        this._logoutCallback();
      }
    }
  }

  callStateChanged = (callId: string, state: RTC_CALL_STATE) => {
    if (state === RTC_CALL_STATE.DISCONNECTED) {
      this._processLogoutIfNeeded();
      delete this._telephonyCallDelegate;
    }
  }

  logout(callback: LogoutCallback) {
    const callCount = this._rtcAccount.callCount();
    this._logoutCallback = callback;
    if (callCount > 0) {
      // there is an ongoing call, delay logout
      this._isDisposing = true;
    } else {
      this._rtcAccount.logout();
      if (this._logoutCallback) {
        this._logoutCallback();
      }
    }
  }
}

export { TelephonyAccountController };
