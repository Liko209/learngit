/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 09:32:27
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IRTCCallDelegate,
  RTC_CALL_STATE,
  RTC_CALL_ACTION,
  RTC_CALL_ACTION_ERROR_CODE,
  RTCCallActionSuccessOptions,
  RTCCall,
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
  RECORD_STATE as RTC_RECORD_STATE,
  RTC_CALL_ACTION_DIRECTION,
} from 'voip';

import {
  Call,
  CALL_STATE,
  HOLD_STATE,
  RECORD_STATE,
  CALL_DIRECTION,
  MUTE_STATE,
} from '../entity';
import { ENTITY } from 'sdk/service/eventKey';
import notificationCenter from 'sdk/service/notificationCenter';
import { telephonyLogger } from 'foundation/log';
import { IEntityCacheController } from 'sdk/framework/controller/interface/IEntityCacheController';
import _ from 'lodash';
import { ToggleController, ToggleRequest } from './ToggleController';
import {
  CALL_ACTION_ERROR_CODE,
  CallOptions,
  CallDelegate,
  TRANSFER_TYPE,
} from '../types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { PhoneNumberService } from 'sdk/module/phoneNumber';
import { isOnline } from '../constants';

type CallActionResult = string | CALL_ACTION_ERROR_CODE;

interface IResultResolveFn {
  (value: CallActionResult | PromiseLike<CallActionResult>): void;
}

interface IResultRejectFn {
  (value: CallActionResult | PromiseLike<CallActionResult>): void;
}

const ACR_ON = -8;
const NUMBER_PREFIX = '*0';

class TelephonyCallController implements IRTCCallDelegate {
  private _rtcCall: RTCCall;
  private _entityId: number;
  private _entityCacheController: IEntityCacheController<Call>;
  private _callActionCallbackMap: Map<
    string,
    { resolve: IResultResolveFn; reject: IResultRejectFn }
  >;
  private _holdToggle: ToggleController;
  private _recordToggle: ToggleController;
  private _callDelegate: CallDelegate;

  constructor(
    entityId: number,
    entityCacheController: IEntityCacheController<Call>,
  ) {
    this._entityCacheController = entityCacheController;
    this._entityId = entityId;
    this._initCallEntity();
    this._callActionCallbackMap = new Map();
    this._holdToggle = new ToggleController();
    this._recordToggle = new ToggleController();
  }

  private _initCallEntity() {
    const call: Call = {
      id: this._entityId,
      to_num: '',
      from_num: '',
      uuid: '',
      call_state: CALL_STATE.IDLE,
      hold_state: HOLD_STATE.DISABLED,
      record_state: RECORD_STATE.DISABLED,
      startTime: Date.now(),
      connectingTime: 0,
      connectTime: 0,
      disconnectTime: 0,
      session_id: '',
      direction: CALL_DIRECTION.OUTBOUND,
      mute_state: MUTE_STATE.IDLE,
      from_name: '',
      to_name: '',
    };
    notificationCenter.emitEntityUpdate(ENTITY.CALL, [call]);
  }

  getEntityId() {
    return this._entityId;
  }

  setCallDelegate(delegate: CallDelegate) {
    this._callDelegate = delegate;
  }

  isOnHold() {
    const callEntity = this._getCallEntity();
    return callEntity ? callEntity.hold_state === HOLD_STATE.HELD : false;
  }

  setRtcCall(call: RTCCall, isSwitchCall: boolean, callOption?: CallOptions) {
    this._rtcCall = call;
    const callEntity = this._getCallEntity();
    if (callEntity) {
      callEntity.uuid = call.getCallInfo().uuid;
      callEntity.connectingTime = Date.now();

      if (isSwitchCall && callOption) {
        this._setSwitchCallInfo(callEntity, callOption);
      } else {
        callEntity.to_num = call.getCallInfo().toNum;
        callEntity.to_name = call.getCallInfo().toName;
        callEntity.from_num = call.getCallInfo().fromNum;
        callEntity.from_name = call.getCallInfo().fromName;

        if (call.isIncomingCall()) {
          callEntity.direction = CALL_DIRECTION.INBOUND;
        }
      }
      notificationCenter.emitEntityUpdate(ENTITY.CALL, [callEntity]);
    }
  }

  private _setSwitchCallInfo(callEntity: Call, callOption: CallOptions) {
    const isOutbound = callOption.callDirection === CALL_DIRECTION.OUTBOUND;
    if (isOutbound) {
      callEntity.to_num = callOption.replaceNumber || '';
      callEntity.to_name = callOption.replaceName || '';
    } else {
      callEntity.to_num = callOption.replaceNumber || '';
      callEntity.to_name = callOption.replaceName || '';
    }
    // a switch call is a outbound call
    callEntity.direction = CALL_DIRECTION.OUTBOUND;
  }

  private _handleCallDisconnectingState(call: Call) {
    if (
      call.call_state !== CALL_STATE.DISCONNECTED &&
      call.call_state !== CALL_STATE.DISCONNECTING
    ) {
      call.call_state = CALL_STATE.DISCONNECTING;
      this._setSipData(call);
      notificationCenter.emitEntityUpdate(ENTITY.CALL, [call]);
    }
  }

  private _handleCallDisconnectedState(call: Call) {
    call.call_state = CALL_STATE.DISCONNECTED;
    if (!call.disconnectTime) {
      call.disconnectTime = Date.now();
    }
    notificationCenter.emitEntityUpdate(ENTITY.CALL, [call]);
  }

  private _handleCallConnectedState(call: Call) {
    call.call_state = CALL_STATE.CONNECTED;
    call.hold_state = HOLD_STATE.IDLE;
    call.record_state = RECORD_STATE.IDLE;
    call.connectTime = Date.now();
    call.session_id = this._rtcCall.getCallInfo().sessionId;
    notificationCenter.emitEntityUpdate(ENTITY.CALL, [call]);
  }

  private _handleCallConnectingState(call: Call) {
    call.call_state = CALL_STATE.CONNECTING;
    notificationCenter.emitEntityUpdate(ENTITY.CALL, [call]);
  }

  private _getCallEntity() {
    const originalCall = this._entityCacheController.getSynchronously(
      this._entityId,
    );
    return originalCall ? _.cloneDeep(originalCall) : null;
  }

  private _handleCallStateChanged(state: CALL_STATE) {
    const call = this._getCallEntity();
    if (call) {
      switch (state) {
        case CALL_STATE.CONNECTING:
          this._handleCallConnectingState(call);
          break;
        case CALL_STATE.CONNECTED:
          this._handleCallConnectedState(call);
          break;
        case CALL_STATE.DISCONNECTING:
          this._handleCallDisconnectingState(call);
          break;
        case CALL_STATE.DISCONNECTED:
          this._handleCallDisconnectedState(call);
          break;
        default:
          break;
      }
    } else {
      telephonyLogger.warn(`No entity is found for call: ${this._entityId}`);
    }
  }

  private _setSipData(callEntity: Call) {
    callEntity.call_id =
      this._rtcCall.getCallInfo().callId || callEntity.call_id;
    callEntity.from_tag =
      this._rtcCall.getCallInfo().fromTag || callEntity.from_tag;
    callEntity.to_tag = this._rtcCall.getCallInfo().toTag || callEntity.to_tag;
  }

  async onCallStateChange(state: RTC_CALL_STATE) {
    const callState: CALL_STATE = (state as string) as CALL_STATE;

    state === RTC_CALL_STATE.DISCONNECTED &&
      this._handleCallStateChanged(CALL_STATE.DISCONNECTING);

    this._handleCallStateChanged(callState);
  }

  private _handleHoldAction(isSuccess: boolean) {
    if (!isSuccess) {
      this._updateCallHoldState(HOLD_STATE.IDLE);
      const state = this._rtcCall.getRecordState();
      this._updateCallRecordState(
        state === RTC_RECORD_STATE.IDLE
          ? RECORD_STATE.IDLE
          : RECORD_STATE.RECORDING,
      );
    }
  }

  private _handleUnHoldAction(isSuccess: boolean) {
    if (!isSuccess) {
      this._updateCallHoldState(HOLD_STATE.HELD);
      this._updateCallRecordState(RECORD_STATE.DISABLED);
    }
  }

  private _transformCallActionErrorCode(code: number) {
    let res = CALL_ACTION_ERROR_CODE.OTHERS;
    switch (code) {
      case RTC_CALL_ACTION_ERROR_CODE.INVALID:
        res = CALL_ACTION_ERROR_CODE.INVALID;
        break;
      case RTC_CALL_ACTION_ERROR_CODE.OTHER_ACTION_IN_PROGRESS:
        res = CALL_ACTION_ERROR_CODE.OTHER_ACTION_IN_PROGRESS;
        break;
      case ACR_ON:
        res = CALL_ACTION_ERROR_CODE.ACR_ON;
        break;
      default:
        break;
    }
    return res;
  }

  private _handleStartRecordAction(
    isSuccess: boolean,
    options: RTCCallActionSuccessOptions | number,
  ) {
    let res = CALL_ACTION_ERROR_CODE.NO_ERROR;
    if (!isSuccess) {
      this._updateCallRecordState(RECORD_STATE.IDLE);
      res =
        options && typeof options === 'number'
          ? this._transformCallActionErrorCode(options)
          : CALL_ACTION_ERROR_CODE.OTHERS;
    }

    return res;
  }

  private _handleStopRecordAction(
    isSuccess: boolean,
    options: RTCCallActionSuccessOptions | number,
  ) {
    let res = CALL_ACTION_ERROR_CODE.NO_ERROR;

    if (!isSuccess) {
      this._updateCallRecordState(RECORD_STATE.RECORDING);
      res =
        options && typeof options === 'number'
          ? this._transformCallActionErrorCode(options)
          : CALL_ACTION_ERROR_CODE.OTHERS;
    }

    return res;
  }

  private _handleToggleState(callAction: RTC_CALL_ACTION, isSuccess: boolean) {
    let toggleController: ToggleController | null = null;
    switch (callAction) {
      case RTC_CALL_ACTION.HOLD:
      case RTC_CALL_ACTION.UNHOLD:
        toggleController = this._holdToggle;
        break;
      case RTC_CALL_ACTION.START_RECORD:
      case RTC_CALL_ACTION.STOP_RECORD:
        toggleController = this._recordToggle;
        break;
      default:
        break;
    }
    if (toggleController) {
      isSuccess ? toggleController.onSuccess() : toggleController.onFailure();
    }
  }

  private _handleParkAction(
    isSuccess: boolean,
    options: RTCCallActionSuccessOptions | number,
  ) {
    return options &&
      typeof options !== 'number' &&
      isSuccess &&
      options.parkExtension
      ? options.parkExtension
      : '';
  }

  private _handleActionResult(
    callAction: RTC_CALL_ACTION,
    isSuccess: boolean,
    options: RTCCallActionSuccessOptions | number,
  ) {
    let res: string | CALL_ACTION_ERROR_CODE = '';

    switch (callAction) {
      case RTC_CALL_ACTION.HOLD:
        this._handleHoldAction(isSuccess);
        break;
      case RTC_CALL_ACTION.UNHOLD:
        this._handleUnHoldAction(isSuccess);
        break;
      case RTC_CALL_ACTION.START_RECORD:
        res = this._handleStartRecordAction(isSuccess, options);
        break;
      case RTC_CALL_ACTION.STOP_RECORD:
        res = this._handleStopRecordAction(isSuccess, options);
        break;
      case RTC_CALL_ACTION.PARK:
        res = this._handleParkAction(isSuccess, options);
        break;
      case RTC_CALL_ACTION.TRANSFER:
      case RTC_CALL_ACTION.WARM_TRANSFER:
        res = options as CALL_ACTION_ERROR_CODE;
        break;
      default:
        break;
    }

    this._handleToggleState(callAction, isSuccess);
    return res;
  }

  onCallActionSuccess(
    callAction: RTC_CALL_ACTION,
    options: RTCCallActionSuccessOptions,
  ) {
    const res = this._handleActionResult(callAction, true, options);
    this._handleCallActionCallback(callAction, true, res);
    this._callDelegate &&
      this._callDelegate.onCallActionSuccess(
        this._entityId,
        callAction,
        options,
      );
  }

  private _updateCallHoldState(state: HOLD_STATE) {
    const call = this._getCallEntity();
    if (call) {
      call.hold_state = state;
      notificationCenter.emitEntityUpdate(ENTITY.CALL, [call]);
    } else {
      telephonyLogger.warn(`No entity is found for call: ${this._entityId}`);
    }
  }

  private _updateCallRecordState(state: RECORD_STATE) {
    const call = this._getCallEntity();
    if (call) {
      call.record_state = state;
      notificationCenter.emitEntityUpdate(ENTITY.CALL, [call]);
    } else {
      telephonyLogger.warn(`No entity is found for call: ${this._entityId}`);
    }
  }

  onCallActionFailed(callAction: RTC_CALL_ACTION, code: number) {
    const res = this._handleActionResult(callAction, false, code);
    this._handleCallActionCallback(callAction, false, res);
    this._callDelegate &&
      this._callDelegate.onCallActionFailed(this._entityId, callAction, code);
  }

  hangUp() {
    this._handleCallStateChanged(CALL_STATE.DISCONNECTING);
    this._rtcCall.hangup();
  }

  private _updateCallMuteState(state: MUTE_STATE) {
    const call = this._getCallEntity();
    if (call) {
      call.mute_state = state;
      notificationCenter.emitEntityUpdate(ENTITY.CALL, [call]);
    } else {
      telephonyLogger.warn(`No entity is found for call: ${this._entityId}`);
    }
  }

  mute() {
    this._updateCallMuteState(MUTE_STATE.MUTED);
    this._rtcCall.mute();
  }

  muteAll() {
    this._updateCallMuteState(MUTE_STATE.MUTED);
    this._rtcCall.mute(RTC_CALL_ACTION_DIRECTION.LOCAL);
    this._rtcCall.mute(RTC_CALL_ACTION_DIRECTION.REMOTE);
  }

  unmute() {
    this._updateCallMuteState(MUTE_STATE.IDLE);
    this._rtcCall.unmute();
  }

  hold() {
    this._updateCallHoldState(HOLD_STATE.HELD);
    const state = this._rtcCall.getRecordState();
    this._updateCallRecordState(
      state === RTC_RECORD_STATE.IDLE
        ? RECORD_STATE.DISABLED
        : RECORD_STATE.RECORDING_DISABLED,
    );
    return new Promise((resolve, reject) => {
      this._saveCallActionCallback(RTC_CALL_ACTION.HOLD, resolve, reject);
      const request: ToggleRequest = {
        value: true,
        func: () => {
          this._rtcCall.hold();
        },
      };
      this._holdToggle.do(request);
    });
  }

  unhold() {
    this._updateCallHoldState(HOLD_STATE.IDLE);
    const state = this._rtcCall.getRecordState();
    this._updateCallRecordState(
      state === RTC_RECORD_STATE.IDLE
        ? RECORD_STATE.IDLE
        : RECORD_STATE.RECORDING,
    );

    return new Promise((resolve, reject) => {
      this._saveCallActionCallback(RTC_CALL_ACTION.UNHOLD, resolve, reject);
      const request: ToggleRequest = {
        value: false,
        func: () => {
          this._rtcCall.unhold();
        },
      };
      this._holdToggle.do(request);
    });
  }

  startRecord() {
    this._updateCallRecordState(RECORD_STATE.RECORDING);
    return new Promise((resolve, reject) => {
      this._saveCallActionCallback(
        RTC_CALL_ACTION.START_RECORD,
        resolve,
        reject,
      );
      const request: ToggleRequest = {
        value: true,
        func: () => {
          this._rtcCall.startRecord();
        },
      };
      this._recordToggle.do(request);
    });
  }

  stopRecord() {
    this._updateCallRecordState(RECORD_STATE.IDLE);
    return new Promise((resolve, reject) => {
      this._saveCallActionCallback(
        RTC_CALL_ACTION.STOP_RECORD,
        resolve,
        reject,
      );
      const request: ToggleRequest = {
        value: false,
        func: () => {
          this._rtcCall.stopRecord();
        },
      };
      this._recordToggle.do(request);
    });
  }

  dtmf(digits: string) {
    this._rtcCall.dtmf(digits);
  }

  answer() {
    this._updateConnectingTime();
    this._rtcCall.answer();
  }

  sendToVoiceMail() {
    this._rtcCall.sendToVoicemail();
  }

  park() {
    return new Promise((resolve, reject) => {
      this._saveCallActionCallback(RTC_CALL_ACTION.PARK, resolve, reject);
      this._rtcCall.park();
    });
  }

  flip(flipNumber: number) {
    return new Promise((resolve, reject) => {
      this._saveCallActionCallback(RTC_CALL_ACTION.FLIP, resolve, reject);
      this._rtcCall.flip(flipNumber);
    });
  }

  forward(phoneNumber: string) {
    return new Promise((resolve, reject) => {
      this._saveCallActionCallback(RTC_CALL_ACTION.FORWARD, resolve, reject);
      this._rtcCall.forward(phoneNumber);
    });
  }

  async transfer(type: TRANSFER_TYPE, transferTo: string) {
    return new Promise(async (resolve, reject) => {
      this._saveCallActionCallback(
        type === TRANSFER_TYPE.WARM_TRANSFER
          ? RTC_CALL_ACTION.WARM_TRANSFER
          : RTC_CALL_ACTION.TRANSFER,
        resolve,
        reject,
      );
      if (!isOnline()) {
        reject(CALL_ACTION_ERROR_CODE.NOT_NETWORK);
      }
      if (type === TRANSFER_TYPE.WARM_TRANSFER) {
        this._rtcCall.warmTransfer(transferTo);
      } else {
        const phoneNumberService = ServiceLoader.getInstance<
          PhoneNumberService
        >(ServiceConfig.PHONE_NUMBER_SERVICE);
        let number = await phoneNumberService.getE164PhoneNumber(transferTo);
        if (!number) {
          reject(CALL_ACTION_ERROR_CODE.INVALID_PHONE_NUMBER);
        }
        if (type === TRANSFER_TYPE.TO_VOICEMAIL) {
          number = this._handleNumberToVoicemail(number);
        }
        this._rtcCall.transfer(number);
      }
    });
  }

  private _handleNumberToVoicemail(number: string) {
    return `${NUMBER_PREFIX}${number}`;
  }

  ignore() {
    this._rtcCall.ignore();
  }

  startReply() {
    this._rtcCall.startReply();
  }

  replyWithMessage(message: string) {
    this._rtcCall.replyWithMessage(message);
  }

  replyWithPattern(
    pattern: RTC_REPLY_MSG_PATTERN,
    time?: number,
    timeUnit?: RTC_REPLY_MSG_TIME_UNIT,
  ) {
    this._rtcCall.replyWithPattern(pattern, time, timeUnit);
  }

  private _saveCallActionCallback(
    key: RTC_CALL_ACTION,
    resolve: IResultResolveFn,
    reject: IResultRejectFn,
  ) {
    this._callActionCallbackMap.set(key, { resolve, reject });
  }

  private _handleCallActionCallback(
    callAction: RTC_CALL_ACTION,
    isSuccess: boolean,
    result: string | CALL_ACTION_ERROR_CODE,
  ) {
    const promiseResolvers = this._callActionCallbackMap.get(callAction);
    if (promiseResolvers) {
      if (isSuccess) {
        promiseResolvers.resolve(result);
      } else {
        promiseResolvers.reject(result);
      }
    }
  }

  private _updateConnectingTime() {
    const callEntity = this._getCallEntity();
    if (callEntity) {
      callEntity.connectingTime = Date.now();
      notificationCenter.emitEntityUpdate(ENTITY.CALL, [callEntity]);
    }
  }
}

export { TelephonyCallController };
