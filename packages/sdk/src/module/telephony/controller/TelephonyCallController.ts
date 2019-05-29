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
import { ITelephonyCallDelegate } from '../service/ITelephonyCallDelegate';
import { CallStateCallback } from '../types';
import { Call, CALL_STATE, HOLD_STATE } from '../entity';
import { ENTITY } from 'sdk/service/eventKey';
import notificationCenter from 'sdk/service/notificationCenter';
import { telephonyLogger } from 'foundation';
import { IEntityCacheController } from 'sdk/framework/controller/interface/IEntityCacheController';
import _ from 'lodash';

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
  private _callDelegate: ITelephonyCallDelegate;
  private _rtcCall: RTCCall;
  private _callback: CallStateCallback;
  private _entityId: number;
  private _entityCacheController: IEntityCacheController<Call>;
  private _callActionCallbackMap: Map<
    string,
    { resolve: IResultResolveFn; reject: IResultRejectFn }[]
  >;


  constructor(
    entityId: number,
    delegate: ITelephonyCallDelegate,
    entityCacheController: IEntityCacheController<Call>,
  ) {
    this._callDelegate = delegate;
    this._entityCacheController = entityCacheController;
    this._entityId = entityId;
    this._initCallEntity();
    this._callActionCallbackMap = new Map();
  }

  private _initCallEntity() {
    const call: Call = {
      id: this._entityId,
      to_num: '',
      from_num: '',
      call_id: '',
      call_state: CALL_STATE.IDLE,
      hold_state: HOLD_STATE.DISABLE,
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
          break;
        case RTC_CALL_STATE.DISCONNECTED:
          call.call_state = CALL_STATE.DISCONNECTED;
          break;
      }
      notificationCenter.emitEntityUpdate(ENTITY.CALL, [call]);
    } else {
      telephonyLogger.warn(`No entity is found for call: ${this._entityId}`);
    }
  }

  async onCallStateChange(state: RTC_CALL_STATE) {
    this._handleCallStateChanged(state);
    this._callDelegate.onCallStateChange(
      this._rtcCall.getCallInfo().uuid,
      state,
    );
    if (this._callback) {
      this._callback(this._rtcCall.getCallInfo().uuid, state);
    }
  }

  onCallActionSuccess(
    callAction: RTC_CALL_ACTION,
    options: RTCCallActionSuccessOptions,
  ) {
    // TODO, waiting Lewi to refactor all the actions to have the same handling flow
    if (callAction === RTC_CALL_ACTION.PARK) {
      this._handleCallActionCallback(callAction, true, options);
    } else {
      this._callDelegate.onCallActionSuccess(callAction, options);
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
  }

  private _handleUnHoldActionFailed() {
    this._updateCallHoldState(HOLD_STATE.HELD);
  }

  onCallActionFailed(callAction: RTC_CALL_ACTION) {
    switch (callAction) {
      case RTC_CALL_ACTION.HOLD:
        this._handleHoldActionFailed();
        break;
      case RTC_CALL_ACTION.UNHOLD:
        this._handleUnHoldActionFailed();
        break;
      case RTC_CALL_ACTION.PARK:
        this._handleCallActionCallback(callAction, false);
        break;
      default:
        this._callDelegate.onCallActionFailed(callAction);
    }
  }

  hangUp() {
    this._rtcCall.hangup();
  }

  mute() {
    this._rtcCall.mute();
  }

  unmute() {
    this._rtcCall.unmute();
  }

  hold() {
    this._updateCallHoldState(HOLD_STATE.HELD);
    this._rtcCall.hold();
  }

  unhold() {
    this._updateCallHoldState(HOLD_STATE.IDLE);
    this._rtcCall.unhold();
  }

  startRecord() {
    this._rtcCall.startRecord();
  }

  stopRecord() {
    this._rtcCall.stopRecord();
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
