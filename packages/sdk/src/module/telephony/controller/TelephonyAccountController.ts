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
import { TelephonyService } from '../service';
import { PhoneNumberService } from 'sdk/module/phoneNumber';
import { PhoneNumberAnonymous } from 'sdk/module/phoneNumber/types';
import { IEntityCacheController } from 'sdk/framework/controller/interface/IEntityCacheController';
import { Call } from '../entity';

class TelephonyAccountController implements IRTCAccountDelegate {
  private _telephonyAccountDelegate: ITelephonyAccountDelegate;
  private _telephonyCallDelegate: TelephonyCallController;
  private _rtcAccount: RTCAccount;
  private _callDelegate: ITelephonyCallDelegate;
  private _makeCallController: MakeCallController;
  private _isDisposing: boolean = false;
  private _logoutCallback: LogoutCallback;
  private _entityCacheController: IEntityCacheController<Call>;

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

  setDependentController(entityCacheController: IEntityCacheController<Call>) {
    this._entityCacheController = entityCacheController;
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
    const telephonyConfig = ServiceLoader.getInstance<TelephonyService>(
      ServiceConfig.TELEPHONY_SERVICE,
    ).userConfig;
    const res = telephonyConfig.getLastCalledNumber();
    return res ? res : '';
  }

  setLastCalledNumber(num: string) {
    const telephonyConfig = ServiceLoader.getInstance<TelephonyService>(
      ServiceConfig.TELEPHONY_SERVICE,
    ).userConfig;
    telephonyConfig.setLastCalledNumber(num);
  }

  async makeCall(toNumber: string, fromNum: string) {
    const phoneNumberService = ServiceLoader.getInstance<PhoneNumberService>(
      ServiceConfig.PHONE_NUMBER_SERVICE,
    );

    if (!phoneNumberService.isValidNumber(toNumber)) {
      this._callDelegate &&
        this._callDelegate.onCallStateChange('', RTC_CALL_STATE.DISCONNECTED);
      return MAKE_CALL_ERROR_CODE.INVALID_PHONE_NUMBER;
    }

    const e164ToNumber = await phoneNumberService.getE164PhoneNumber(toNumber);

    if (!e164ToNumber) {
      this._callDelegate &&
        this._callDelegate.onCallStateChange('', RTC_CALL_STATE.DISCONNECTED);
      return MAKE_CALL_ERROR_CODE.INVALID_PHONE_NUMBER;
    }
    this.setLastCalledNumber(toNumber);

    let result: MAKE_CALL_ERROR_CODE = MAKE_CALL_ERROR_CODE.NO_ERROR;
    do {
      result = this._checkVoipStatus();
      if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }

      result = await this._makeCallController.tryMakeCall(e164ToNumber);
      if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }

      if (this._telephonyCallDelegate) {
        return MAKE_CALL_ERROR_CODE.MAX_CALLS_REACHED;
      }
      this._telephonyCallDelegate = new TelephonyCallController(
        Date.now(),
        this._callDelegate,
        this._entityCacheController,
      );
      this._telephonyCallDelegate.setCallStateCallback(this.callStateChanged);

      let call: RTCCall | null;
      if (fromNum) {
        let e164FromNum = fromNum;
        if (fromNum !== PhoneNumberAnonymous) {
          e164FromNum = await phoneNumberService.getE164PhoneNumber(fromNum);
        }
        telephonyLogger.debug(
          `Place a call voip toNum: ${e164ToNumber} fromNum: ${e164FromNum}`,
        );
        call = this._rtcAccount.makeCall(
          e164ToNumber,
          this._telephonyCallDelegate,
          { fromNumber: e164FromNum },
        );
      } else {
        telephonyLogger.debug(`Place a call to voip toNum: ${e164ToNumber}`);
        call = this._rtcAccount.makeCall(
          e164ToNumber,
          this._telephonyCallDelegate,
        );
      }

      if (!call) {
        result = MAKE_CALL_ERROR_CODE.VOIP_CALLING_SERVICE_UNAVAILABLE;
        this._telephonyCallDelegate && delete this._telephonyCallDelegate;
        break;
      }

      this._telephonyCallDelegate.setRtcCall(call);
      this._telephonyAccountDelegate.onMadeOutgoingCall(
        this._telephonyCallDelegate.getEntityId().toString(),
      );
    } while (false);

    if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
      this._callDelegate &&
        this._callDelegate.onCallStateChange('', RTC_CALL_STATE.DISCONNECTED);
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

  async hold(callId: string) {
    return (
      this._telephonyCallDelegate && (await this._telephonyCallDelegate.hold())
    );
  }

  async unhold(callId: string) {
    return (
      this._telephonyCallDelegate &&
      (await this._telephonyCallDelegate.unhold())
    );
  }

  async startRecord(callId: string) {
    return (
      this._telephonyCallDelegate &&
      (await this._telephonyCallDelegate.startRecord())
    );
  }

  async stopRecord(callId: string) {
    return (
      this._telephonyCallDelegate &&
      (await this._telephonyCallDelegate.stopRecord())
    );
  }

  dtmf(callId: string, digits: string) {
    this._telephonyCallDelegate && this._telephonyCallDelegate.dtmf(digits);
  }

  answer(callId: string) {
    this._telephonyCallDelegate && this._telephonyCallDelegate.answer();
  }

  sendToVoiceMail(callId: string) {
    this._telephonyCallDelegate &&
      this._telephonyCallDelegate.sendToVoiceMail();
  }

  async park(callId: string) {
    return (
      this._telephonyCallDelegate && (await this._telephonyCallDelegate.park())
    );
  }

  async flip(callId: string, flipNumber: number) {
    return (
      this._telephonyCallDelegate &&
      (await this._telephonyCallDelegate.flip(flipNumber))
    );
  }

  async forward(callId: string, phoneNumber: string) {
    return (
      this._telephonyCallDelegate &&
      (await this._telephonyCallDelegate.forward(phoneNumber))
    );
  }

  ignore(callId: string) {
    this._telephonyCallDelegate && this._telephonyCallDelegate.ignore();
  }

  startReply(callId: string) {
    this._telephonyCallDelegate && this._telephonyCallDelegate.startReply();
  }

  replyWithMessage(callId: string, message: string) {
    this._telephonyCallDelegate &&
      this._telephonyCallDelegate.replyWithMessage(message);
  }

  replyWithPattern(
    callId: string,
    pattern: RTC_REPLY_MSG_PATTERN,
    time?: number,
    timeUnit?: RTC_REPLY_MSG_TIME_UNIT,
  ) {
    this._telephonyCallDelegate &&
      this._telephonyCallDelegate.replyWithPattern(pattern, time, timeUnit);
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
      Date.now(),
      this._callDelegate,
      this._entityCacheController,
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
