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
  private _callActionCallbackMap: Map<
    string,
    { resolve: IResultResolveFn; reject: IResultRejectFn }[]
  >;

  constructor(delegate: ITelephonyCallDelegate) {
    this._callDelegate = delegate;
    this._callActionCallbackMap = new Map();
  }

  setRtcCall(call: RTCCall) {
    this._rtcCall = call;
  }

  setCallStateCallback(callback: CallStateCallback) {
    this._callback = callback;
  }

  onCallStateChange(state: RTC_CALL_STATE) {
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
    if (this._isSupportNewFlow(callAction)) {
      this._handleCallActionCallback(callAction, true, options);
    } else {
      this._callDelegate.onCallActionSuccess(callAction, options);
    }
  }

  onCallActionFailed(callAction: RTC_CALL_ACTION) {
    // TODO, waiting Lewi to refactor all the actions to have the same handling flow
    if (this._isSupportNewFlow(callAction)) {
      this._handleCallActionCallback(callAction, false);
    } else {
      this._callDelegate.onCallActionFailed(callAction);
    }
  }

  private _isSupportNewFlow(callAction: RTC_CALL_ACTION) {
    // this function should be removed after refactoring by Lewi
    return (
      callAction === RTC_CALL_ACTION.PARK ||
      callAction === RTC_CALL_ACTION.FLIP ||
      callAction === RTC_CALL_ACTION.FORWARD
    );
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
    this._rtcCall.hold();
  }

  unhold() {
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
