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
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
} from 'voip';
import { TelephonyCallController } from './TelephonyCallController';
import { ITelephonyDelegate } from '../service/ITelephonyDelegate';
import { MAKE_CALL_ERROR_CODE, LogoutCallback } from '../types';
import { telephonyLogger } from 'foundation';
import { MakeCallController } from './MakeCallController';
import { RCInfoService } from '../../rcInfo';
import { ERCServiceFeaturePermission } from '../../rcInfo/types';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { TelephonyService } from '../service';
import { PhoneNumberService } from 'sdk/module/phoneNumber';
import { IEntityCacheController } from 'sdk/framework/controller/interface/IEntityCacheController';
import { Call, CALL_STATE } from '../entity';
import { PhoneNumberType } from 'sdk/module/phoneNumber/entity';
import { ENTITY } from 'sdk/service/eventKey';
import notificationCenter, {
  NotificationEntityPayload,
} from 'sdk/service/notificationCenter';
import { EVENT_TYPES } from 'sdk/service';

class TelephonyAccountController implements IRTCAccountDelegate {
  private _telephonyAccountDelegate: ITelephonyDelegate;
  private _rtcAccount: RTCAccount;
  private _makeCallController: MakeCallController;
  private _isDisposing: boolean = false;
  private _logoutCallback: LogoutCallback;
  private _entityCacheController: IEntityCacheController<Call>;
  private _callControllerList: Map<number, TelephonyCallController> = new Map();

  constructor(rtcEngine: RTCEngine) {
    this._rtcAccount = rtcEngine.createAccount(this);
    this._rtcAccount.handleProvisioning();
    this._makeCallController = new MakeCallController();
    this._subscribeNotifications();
  }

  private _handleCallStateChanged = (
    payload: NotificationEntityPayload<Call>,
  ) => {
    if (payload.type === EVENT_TYPES.UPDATE) {
      const call: Call[] = Array.from(payload.body.entities.values());
      call.forEach((item: Call) => {
        if (item.call_state === CALL_STATE.DISCONNECTED) {
          this._processLogoutIfNeeded();
          this._removeControllerFromList(item.id);
        }
      });
    }
  };

  private _subscribeNotifications() {
    notificationCenter.on(ENTITY.CALL, this._handleCallStateChanged);
  }

  private _unSubscribeNotifications() {
    notificationCenter.off(ENTITY.CALL, this._handleCallStateChanged);
  }

  setAccountDelegate(delegate: ITelephonyDelegate) {
    this._telephonyAccountDelegate = delegate;
  }

  setDependentController(entityCacheController: IEntityCacheController<Call>) {
    this._entityCacheController = entityCacheController;
  }

  private _checkVoipStatus(): MAKE_CALL_ERROR_CODE {
    let res = MAKE_CALL_ERROR_CODE.NO_ERROR;
    const sipProvFlag = this._rtcAccount.getSipProvFlags();
    /* eslint-disable */
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

  getVoipState() {
    return this._rtcAccount.state();
  }

  getEmergencyAddress() {
    const sipProv = this._rtcAccount.getSipProv();
    if (sipProv && sipProv.device) {
      return sipProv.device.emergencyServiceAddress;
    }
    return undefined;
  }

  getSipProvision() {
    const sipProv = this._rtcAccount.getSipProv();
    return sipProv ? sipProv : undefined;
  }

  setLastCalledNumber(num: string) {
    const telephonyConfig = ServiceLoader.getInstance<TelephonyService>(
      ServiceConfig.TELEPHONY_SERVICE,
    ).userConfig;
    telephonyConfig.setLastCalledNumber(num);
  }

  private _addControllerToList(
    callId: number,
    controller: TelephonyCallController,
  ) {
    this._callControllerList.set(callId, controller);
  }

  private _removeControllerFromList(callId: number) {
    this._callControllerList.delete(callId);
  }

  async makeCall(toNumber: string, fromNum?: string) {
    const phoneNumberService = ServiceLoader.getInstance<PhoneNumberService>(
      ServiceConfig.PHONE_NUMBER_SERVICE,
    );

    if (!phoneNumberService.isValidNumber(toNumber)) {
      return MAKE_CALL_ERROR_CODE.INVALID_PHONE_NUMBER;
    }

    const e164ToNumber = await phoneNumberService.getE164PhoneNumber(toNumber);

    if (!e164ToNumber) {
      return MAKE_CALL_ERROR_CODE.INVALID_PHONE_NUMBER;
    }
    this.setLastCalledNumber(toNumber);

    let result: MAKE_CALL_ERROR_CODE = MAKE_CALL_ERROR_CODE.NO_ERROR;
    /* eslint-disable no-await-in-loop */
    do {
      result = this._checkVoipStatus();
      if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }

      result = await this._makeCallController.tryMakeCall(e164ToNumber);
      if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }

      const callController: TelephonyCallController = new TelephonyCallController(
        Date.now(),
        this._entityCacheController,
      );

      let call: RTCCall | null;
      if (fromNum) {
        let e164FromNum = fromNum;
        if (fromNum !== PhoneNumberType.PhoneNumberAnonymous) {
          e164FromNum = await phoneNumberService.getE164PhoneNumber(fromNum);
        }
        telephonyLogger.debug(
          `Place a call voip toNum: ${e164ToNumber} fromNum: ${e164FromNum}`,
        );
        call = this._rtcAccount.makeCall(e164ToNumber, callController, {
          fromNumber: e164FromNum,
        });
      } else {
        telephonyLogger.debug(`Place a call to voip toNum: ${e164ToNumber}`);
        call = this._rtcAccount.makeCall(e164ToNumber, callController);
      }

      if (!call) {
        result = MAKE_CALL_ERROR_CODE.VOIP_CALLING_SERVICE_UNAVAILABLE;
        break;
      }

      this._setCall(callController, call);

      if (this._telephonyAccountDelegate) {
        this._telephonyAccountDelegate.onMadeOutgoingCall(
          callController.getEntityId(),
        );
      } else {
        telephonyLogger.warn(
          'No account delegate is specified, unable to notify outgoing call',
        );
      }
    } while (false);

    return result;
  }

  private _getCallControllerById(callId: number) {
    const callController = this._callControllerList.get(callId);
    if (callController) {
      return callController;
    }
    telephonyLogger.warn(`No call controller found for call: ${callId}`);
    return null;
  }

  hangUp(callId: number) {
    const callController = this._getCallControllerById(callId);
    callController && callController.hangUp();
  }

  mute(callId: number) {
    const callController = this._getCallControllerById(callId);
    callController && callController.mute();
  }

  unmute(callId: number) {
    const callController = this._getCallControllerById(callId);
    callController && callController.unmute();
  }

  async hold(callId: number) {
    const callController = this._getCallControllerById(callId);
    return callController && (await callController.hold());
  }

  async unhold(callId: number) {
    const callController = this._getCallControllerById(callId);
    return callController && (await callController.unhold());
  }

  async startRecord(callId: number) {
    const callController = this._getCallControllerById(callId);
    return callController && (await callController.startRecord());
  }

  async stopRecord(callId: number) {
    const callController = this._getCallControllerById(callId);
    return callController && (await callController.stopRecord());
  }

  dtmf(callId: number, digits: string) {
    const callController = this._getCallControllerById(callId);
    callController && callController.dtmf(digits);
  }

  answer(callId: number) {
    const callController = this._getCallControllerById(callId);
    callController && callController.answer();
  }

  sendToVoiceMail(callId: number) {
    const callController = this._getCallControllerById(callId);
    callController && callController.sendToVoiceMail();
  }

  async park(callId: number) {
    const callController = this._getCallControllerById(callId);
    return callController && (await callController.park());
  }

  async flip(callId: number, flipNumber: number) {
    const callController = this._getCallControllerById(callId);
    return callController && (await callController.flip(flipNumber));
  }

  async forward(callId: number, phoneNumber: string) {
    const callController = this._getCallControllerById(callId);
    return callController && (await callController.forward(phoneNumber));
  }

  ignore(callId: number) {
    const callController = this._getCallControllerById(callId);
    callController && callController.ignore();
  }

  startReply(callId: number) {
    const callController = this._getCallControllerById(callId);
    callController && callController.startReply();
  }

  replyWithMessage(callId: number, message: string) {
    const callController = this._getCallControllerById(callId);
    callController && callController.replyWithMessage(message);
  }

  replyWithPattern(
    callId: number,
    pattern: RTC_REPLY_MSG_PATTERN,
    time?: number,
    timeUnit?: RTC_REPLY_MSG_TIME_UNIT,
  ) {
    const callController = this._getCallControllerById(callId);
    callController && callController.replyWithPattern(pattern, time, timeUnit);
  }

  onAccountStateChanged(state: RTC_ACCOUNT_STATE) {}

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

  private _setCall(callController: TelephonyCallController, call: RTCCall) {
    callController.setRtcCall(call);
    call.setCallDelegate(callController);
    this._addControllerToList(callController.getEntityId(), callController);
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
    const callController = new TelephonyCallController(
      Date.now(),
      this._entityCacheController,
    );

    this._setCall(callController, call);

    if (this._telephonyAccountDelegate) {
      this._telephonyAccountDelegate.onReceiveIncomingCall(
        callController.getEntityId(),
      );
    } else {
      telephonyLogger.warn(
        'No account delegate is specified, unable to notify incoming call',
      );
    }
  }

  getCallCount() {
    return this._rtcAccount.callCount();
  }

  onReceiveNewProvFlags(sipFlags: RTCSipFlags) {}

  private _processLogoutIfNeeded() {
    if (this._isDisposing && this._rtcAccount.callCount() === 1) {
      telephonyLogger.info('processing logout request');
      this._rtcAccount.logout();
      this._isDisposing = false;
      if (this._logoutCallback) {
        this._logoutCallback();
      }
      this._unSubscribeNotifications();
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
      this._unSubscribeNotifications();
    }
  }
}

export { TelephonyAccountController };
