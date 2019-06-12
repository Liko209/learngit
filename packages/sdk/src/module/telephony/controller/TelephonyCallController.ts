/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 09:32:27
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IRTCCallDelegate,
  RTC_CALL_STATE,
  RTC_CALL_ACTION,
  RTCCallActionSuccessOptions,
  RTCCall,
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
} from 'voip';
import { CallStateCallback } from '../types';
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
import { telephonyLogger } from 'foundation';
import { IEntityCacheController } from 'sdk/framework/controller/interface/IEntityCacheController';
import _ from 'lodash';
import { ToggleController, ToggleRequest } from './ToggleController';

interface IResultResolveFn {
  (
    value:
      | RTCCallActionSuccessOptions
      | PromiseLike<RTCCallActionSuccessOptions>
      | '',
  ): void;
}

interface IResultRejectFn {
  (value: string | PromiseLike<string>): void;
}

class TelephonyCallController implements IRTCCallDelegate {
  private _rtcCall: RTCCall;
  private _callback: CallStateCallback;
  private _entityId: number;
  private _entityCacheController: IEntityCacheController<Call>;
  private _callActionCallbackMap: Map<
    string,
    { resolve: IResultResolveFn; reject: IResultRejectFn }[]
  >;
  private _holdToggle: ToggleController;
  private _recordToggle: ToggleController;

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
      call_id: '',
      call_state: CALL_STATE.IDLE,
      hold_state: HOLD_STATE.DISABLE,
      record_state: RECORD_STATE.DISABLE,
      startTime: Date.now(),
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

  setRtcCall(call: RTCCall) {
    this._rtcCall = call;
    const callEntity = this._getCallEntity();
    if (callEntity) {
      callEntity.to_num = call.getCallInfo().toNum;
      callEntity.from_num = call.getCallInfo().fromNum;
      callEntity.call_id = call.getCallInfo().uuid;
      callEntity.from_name = call.getCallInfo().fromName;
      callEntity.to_name = call.getCallInfo().toName;
      if (call.isIncomingCall()) {
        callEntity.direction = CALL_DIRECTION.INBOUND;
      }
      notificationCenter.emitEntityUpdate(ENTITY.CALL, [callEntity]);
    }
  }

  setCallStateCallback(callback: CallStateCallback) {
    this._callback = callback;
  }

  private _getCallEntity() {
    const originalCall = this._entityCacheController.getSynchronously(
      this._entityId,
    );
    return originalCall ? _.cloneDeep(originalCall) : null;
  }

  private _handleCallStateChanged(state: RTC_CALL_STATE) {
    const call = this._getCallEntity();
    if (call) {
      switch (state) {
        case RTC_CALL_STATE.CONNECTING:
          call.call_state = CALL_STATE.CONNECTING;
          break;
        case RTC_CALL_STATE.CONNECTED:
          call.call_state = CALL_STATE.CONNECTED;
          call.hold_state = HOLD_STATE.IDLE;
          call.record_state = RECORD_STATE.IDLE;
          call.connectTime = Date.now();
          call.session_id = this._rtcCall.getCallInfo().sessionId;
          break;
        case RTC_CALL_STATE.DISCONNECTED:
          call.call_state = CALL_STATE.DISCONNECTED;
          if (!call.disconnectTime) {
            call.disconnectTime = Date.now();
          }
          break;
      }
      notificationCenter.emitEntityUpdate(ENTITY.CALL, [call]);
    } else {
      telephonyLogger.warn(`No entity is found for call: ${this._entityId}`);
    }
  }

  async onCallStateChange(state: RTC_CALL_STATE) {
    this._handleCallStateChanged(state);
    if (this._callback) {
      this._callback(this._rtcCall.getCallInfo().uuid, state);
    }
  }

  private _handleHoldSuccess(
    callAction: RTC_CALL_ACTION,
    options: RTCCallActionSuccessOptions,
  ) {
    this._holdToggle.onSuccess();
    this._handleCallActionCallback(callAction, true, options);
  }

  private _handleUnHoldSuccess(
    callAction: RTC_CALL_ACTION,
    options: RTCCallActionSuccessOptions,
  ) {
    this._holdToggle.onSuccess();
    this._handleCallActionCallback(callAction, true, options);
  }

  private _handleStartRecordSuccess(
    callAction: RTC_CALL_ACTION,
    options: RTCCallActionSuccessOptions,
  ) {
    this._recordToggle.onSuccess();
    this._handleCallActionCallback(callAction, true, options);
  }

  private _handleStopRecordSuccess(
    callAction: RTC_CALL_ACTION,
    options: RTCCallActionSuccessOptions,
  ) {
    this._recordToggle.onSuccess();
    this._handleCallActionCallback(callAction, true, options);
  }

  onCallActionSuccess(
    callAction: RTC_CALL_ACTION,
    options: RTCCallActionSuccessOptions,
  ) {
    switch (callAction) {
      case RTC_CALL_ACTION.HOLD:
        this._handleHoldSuccess(callAction, options);
        break;
      case RTC_CALL_ACTION.UNHOLD:
        this._handleUnHoldSuccess(callAction, options);
        break;
      case RTC_CALL_ACTION.START_RECORD:
        this._handleStartRecordSuccess(callAction, options);
        break;
      case RTC_CALL_ACTION.STOP_RECORD:
        this._handleStopRecordSuccess(callAction, options);
        break;
      case RTC_CALL_ACTION.PARK:
      case RTC_CALL_ACTION.FLIP:
      case RTC_CALL_ACTION.FORWARD:
        this._handleCallActionCallback(callAction, true, options);
        break;
      default:
        telephonyLogger.info(`CallActionSuccess: ${callAction} is not handled`);
    }
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

  private _handleHoldActionFailed() {
    this._updateCallHoldState(HOLD_STATE.IDLE);
    this._handleCallActionCallback(RTC_CALL_ACTION.HOLD, false);
    this._holdToggle.onFailure();
  }

  private _handleUnHoldActionFailed() {
    this._updateCallHoldState(HOLD_STATE.HELD);
    this._handleCallActionCallback(RTC_CALL_ACTION.UNHOLD, false);
    this._holdToggle.onFailure();
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

  private _handleStartRecordActionFailed() {
    this._updateCallRecordState(RECORD_STATE.IDLE);
    this._handleCallActionCallback(RTC_CALL_ACTION.START_RECORD, false);
    this._recordToggle.onFailure();
  }

  private _handleStopRecordActionFailed() {
    this._updateCallRecordState(RECORD_STATE.RECORDING);
    this._handleCallActionCallback(RTC_CALL_ACTION.STOP_RECORD, false);
    this._recordToggle.onFailure();
  }

  onCallActionFailed(callAction: RTC_CALL_ACTION) {
    switch (callAction) {
      case RTC_CALL_ACTION.HOLD:
        this._handleHoldActionFailed();
        break;
      case RTC_CALL_ACTION.UNHOLD:
        this._handleUnHoldActionFailed();
        break;
      case RTC_CALL_ACTION.START_RECORD:
        this._handleStartRecordActionFailed();
        break;
      case RTC_CALL_ACTION.STOP_RECORD:
        this._handleStopRecordActionFailed();
        break;
      case RTC_CALL_ACTION.PARK:
      case RTC_CALL_ACTION.FLIP:
      case RTC_CALL_ACTION.FORWARD:
        this._handleCallActionCallback(callAction, false);
        break;
      default:
        telephonyLogger.info(
          `onCallActionFailed: ${callAction} is not handled`,
        );
    }
  }

  hangUp() {
    this._handleCallStateChanged(RTC_CALL_STATE.DISCONNECTED);
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

  unmute() {
    this._updateCallMuteState(MUTE_STATE.IDLE);
    this._rtcCall.unmute();
  }

  hold() {
    this._updateCallHoldState(HOLD_STATE.HELD);
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
    const promiseResolvers = this._callActionCallbackMap.get(key) || [];
    promiseResolvers.push({ resolve, reject });
    this._callActionCallbackMap.set(key, promiseResolvers);
  }

  private _handleCallActionCallback(
    callAction: RTC_CALL_ACTION,
    isSuccess: boolean,
    options?: RTCCallActionSuccessOptions,
  ) {
    const promiseResolvers = this._callActionCallbackMap.get(callAction);
    if (promiseResolvers) {
      promiseResolvers.forEach(({ resolve, reject }) => {
        if (isSuccess) {
          resolve(options || '');
        } else {
          reject('');
        }
      });
    }
  }
}

export { TelephonyCallController };
