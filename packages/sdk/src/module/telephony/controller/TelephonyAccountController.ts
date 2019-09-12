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
  RTCNoAudioStateEvent,
  RTCNoAudioDataEvent,
  RTCCallOptions,
  RTCSipEmergencyServiceAddr,
  RTCSipProvisionInfo,
  RTC_CALL_STATE,
  RTC_CALL_ACTION,
  RTCCallActionSuccessOptions,
} from 'voip';
import { TelephonyCallController } from './TelephonyCallController';
import { ITelephonyDelegate } from '../service/ITelephonyDelegate';
import {
  MAKE_CALL_ERROR_CODE,
  LogoutCallback,
  TelephonyDataCollectionInfoConfigType,
  CallOptions,
  CallDelegate,
  TRANSFER_TYPE,
} from '../types';
import { telephonyLogger } from 'foundation/log';
import { MakeCallController } from './MakeCallController';
import { RCInfoService } from '../../rcInfo';
import { ERCServiceFeaturePermission } from '../../rcInfo/types';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { TelephonyService } from '../service';
import { IEntityCacheController } from 'sdk/framework/controller/interface/IEntityCacheController';
import { Call, CALL_STATE } from '../entity';
import { PhoneNumberType } from 'sdk/module/phoneNumber/entity';
import { ENTITY } from 'sdk/service/eventKey';
import notificationCenter, {
  NotificationEntityPayload,
} from 'sdk/service/notificationCenter';
import { EVENT_TYPES } from 'sdk/service';
import { TelephonyDataCollectionController } from './TelephonyDataCollectionController';
import { ActiveCall } from 'sdk/module/rcEventSubscription/types';
import { CALL_DIRECTION } from 'sdk/module/RCItems';
import { E911Controller } from './E911Controller';
import { IPersonService } from 'sdk/module/person/service/IPersonService';
import { IPhoneNumberService } from 'sdk/module/phoneNumber/service/IPhoneNumberService';
import { IRCInfoService } from 'sdk/module/rcInfo/service/IRCInfoService';
import { SettingService } from 'sdk/module/setting/service/SettingService';
import { SettingEntityIds } from 'sdk/module/setting';
import { CALLING_OPTIONS } from 'sdk/module/profile';

class TelephonyAccountController implements IRTCAccountDelegate, CallDelegate {
  private _telephonyAccountDelegate: ITelephonyDelegate;
  private _rtcAccount: RTCAccount;
  private _makeCallController: MakeCallController;
  private _isDisposing: boolean = false;
  private _logoutCallback: LogoutCallback;
  private _entityCacheController: IEntityCacheController<Call>;
  private _callControllerList: Map<number, TelephonyCallController> = new Map();
  private _telephonyDataCollectionController: TelephonyDataCollectionController;
  private _e911Controller: E911Controller;

  constructor(
    rtcEngine: RTCEngine,
    private _personService: IPersonService,
    private _phoneNumberService: IPhoneNumberService,
    private _rcInfoService: IRCInfoService,
  ) {
    this._rtcAccount = rtcEngine.createAccount(this);
    this._makeCallController = new MakeCallController(
      this._personService,
      this._phoneNumberService,
      this._rcInfoService,
    );
    this._subscribeNotifications();
    this._e911Controller = new E911Controller(this._rtcAccount);
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
    this._rtcAccount.handleProvisioning();
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

  setLocalEmergencyAddress(emergencyAddress: RTCSipEmergencyServiceAddr) {
    this._e911Controller.setLocalEmergencyAddress(emergencyAddress);
  }

  updateLocalEmergencyAddress(emergencyAddress: RTCSipEmergencyServiceAddr) {
    this._e911Controller.updateLocalEmergencyAddress(emergencyAddress);
  }

  getRemoteEmergencyAddress() {
    return this._e911Controller.getRemoteEmergencyAddress();
  }

  getSipProv() {
    return this._rtcAccount.getSipProv();
  }

  getWebPhoneId() {
    const sipProv = this._rtcAccount.getSipProv();
    if (sipProv && sipProv.device) {
      return sipProv.device.id;
    }
    return undefined;
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

  async switchCall(myNumber: string, switchCall: ActiveCall) {
    const { to, toName, from, fromName, direction, sipData, id } = switchCall;
    const { fromTag, toTag } = sipData;

    const isOutbound = direction === CALL_DIRECTION.OUTBOUND;
    const options: CallOptions = {
      replacesCallId: id,
      replacesFromTag: fromTag,
      replacesToTag: toTag,
      replaceName: isOutbound ? toName : fromName,
      replaceNumber: isOutbound ? to : from,
      callDirection: direction,
    };

    telephonyLogger.log('make switch call', options);
    return await this._makeCallInternal(myNumber, true, options);
  }

  private async _makeCallInternal(
    toNumber: string,
    isSwitchCall: boolean,
    options?: CallOptions,
  ) {
    if (!this._phoneNumberService.isValidNumber(toNumber)) {
      return MAKE_CALL_ERROR_CODE.INVALID_PHONE_NUMBER;
    }

    let e164ToNumber = await this._phoneNumberService.getE164PhoneNumber(
      toNumber,
    );

    if (!e164ToNumber) {
      return MAKE_CALL_ERROR_CODE.INVALID_PHONE_NUMBER;
    }

    !isSwitchCall && this.setLastCalledNumber(toNumber);

    let result: MAKE_CALL_ERROR_CODE = MAKE_CALL_ERROR_CODE.NO_ERROR;
    /* eslint-disable no-await-in-loop */
    do {
      result = this._checkVoipStatus();
      if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }

      const res = await this._makeCallController.tryMakeCall(toNumber);
      result = res.result;
      if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }

      const callController: TelephonyCallController = new TelephonyCallController(
        Date.now(),
        this._entityCacheController,
      );

      let call: RTCCall | undefined;

      let finalOptions: RTCCallOptions = { ...options };
      if (options) {
        let e164FromNum = options.fromNumber;
        if (e164FromNum) {
          if (e164FromNum !== PhoneNumberType.PhoneNumberAnonymous) {
            e164FromNum = await this._phoneNumberService.getE164PhoneNumber(
              e164FromNum,
            );
            finalOptions.fromNumber = e164FromNum;
          }
        }
      }
      finalOptions.homeCountryId = res.countryId;
      telephonyLogger.debug('Place a call', { finalOptions });
      call = this._rtcAccount.makeCall(
        res.finalNumber,
        callController,
        finalOptions,
      );

      if (!call) {
        result = MAKE_CALL_ERROR_CODE.VOIP_CALLING_SERVICE_UNAVAILABLE;
        break;
      }

      this._setCall(callController, call, isSwitchCall, options);

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

  private _holdActiveCall() {
    this._callControllerList.forEach(
      (callController: TelephonyCallController) => {
        if (!callController.isOnHold()) {
          telephonyLogger.debug(
            `Trying to hold active call: ${callController.getEntityId()}`,
          );
          callController.hold();
        }
      },
    );
  }

  async makeCall(toNumber: string, options?: CallOptions) {
    // hold active call first if there is any
    // just for warm transfer right now
    if (options && !!options.extraCall) {
      this._holdActiveCall();
    }
    return await this._makeCallInternal(toNumber, false, options);
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
    this._holdActiveCall();
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

  async transfer(callId: number, type: TRANSFER_TYPE, transferTo: string) {
    const callController = this._getCallControllerById(callId);
    return callController && (await callController.transfer(type, transferTo));
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

  onCallStateChange(callId: number, state: RTC_CALL_STATE) {}

  onCallActionSuccess(
    callId: number,
    callAction: RTC_CALL_ACTION,
    options: RTCCallActionSuccessOptions,
  ) {}

  onCallActionFailed(
    callId: number,
    callAction: RTC_CALL_ACTION,
    code: number,
  ) {
    //For multiple call, should mute call if call hold is failed
    if (
      callAction === RTC_CALL_ACTION.HOLD &&
      this._callControllerList.size > 1
    ) {
      const call = this._callControllerList.get(callId);
      if (call) {
        telephonyLogger.info(
          `mute call: ${callId} due to the failure of call hold`,
        );
        call.muteAll();
      }
    }
  }

  onAccountStateChanged(state: RTC_ACCOUNT_STATE) {}

  onNoAudioStateEvent(uuid: string, noAudioStateEvent: RTCNoAudioStateEvent) {
    this.telephonyDataCollectionController.traceNoAudioStatus(
      noAudioStateEvent,
    );
    // implement this to get no audio state event
  }
  onNoAudioDataEvent(uuid: string, noAudioDataEvent: RTCNoAudioDataEvent) {
    this.telephonyDataCollectionController.traceNoAudioData(noAudioDataEvent);
    // implement this to get no audio data event
  }

  private async _isJupiterDefaultApp() {
    const entity = await ServiceLoader.getInstance<SettingService>(
      ServiceConfig.SETTING_SERVICE,
    ).getById(SettingEntityIds.Phone_DefaultApp);
    return (entity && entity.value) === CALLING_OPTIONS.GLIP;
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

      // TODO need to refactor If not JupiterDefaultApp, should not generate a call
      const isJupiterDefaultApp = await this._isJupiterDefaultApp();

      if (!isJupiterDefaultApp) {
        showCall = false;
        break;
      }

      // TODO E911 FIJI-4794

      // TODO Block incoming call FIJI-4800
    } while (false);

    return showCall;
  }

  private _setCall(
    callController: TelephonyCallController,
    call: RTCCall,
    isSwitchCall: boolean,
    callOption?: CallOptions,
  ) {
    callController.setRtcCall(call, isSwitchCall, callOption);
    callController.setCallDelegate(this);
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
    if (call.getCallState() === RTC_CALL_STATE.DISCONNECTED) {
      telephonyLogger.info(
        `Call: ${
          call.getCallInfo().uuid
        } is disconnected already, no need to create call`,
      );
      return;
    }
    const callController = new TelephonyCallController(
      Date.now(),
      this._entityCacheController,
    );

    this._setCall(callController, call, false);

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

  getCallIdList() {
    return [...this._callControllerList.keys()];
  }

  onReceiveSipProv(
    newSipProv: RTCSipProvisionInfo,
    oldSipProv: RTCSipProvisionInfo,
  ) {
    telephonyLogger.debug('onReceiveSipProv');
    this._e911Controller.onReceiveSipProv(newSipProv, oldSipProv);
  }

  getLocalEmergencyAddress() {
    return this._e911Controller.getLocalEmergencyAddress();
  }

  isEmergencyAddrConfirmed() {
    return this._e911Controller.isEmergencyAddrConfirmed();
  }

  isAddressEqual(
    objAddr: RTCSipEmergencyServiceAddr,
    othAddr: RTCSipEmergencyServiceAddr,
  ) {
    return this._e911Controller.isAddressEqual(objAddr, othAddr);
  }

  onReceiveNewProvFlags(sipFlags: RTCSipFlags) {
    telephonyLogger.debug('onReceiveNewProvFlags');
    this._e911Controller.onReceiveNewProvFlags(sipFlags);
  }

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

  setDataCollectionInfoConfig = (
    info: TelephonyDataCollectionInfoConfigType,
  ) => {
    this.telephonyDataCollectionController.setDataCollectionInfoConfig(info);
  };

  protected get telephonyDataCollectionController() {
    if (!this._telephonyDataCollectionController) {
      this._telephonyDataCollectionController = new TelephonyDataCollectionController();
    }
    return this._telephonyDataCollectionController;
  }
}

export { TelephonyAccountController };
