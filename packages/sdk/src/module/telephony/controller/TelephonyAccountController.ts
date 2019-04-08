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
} from 'voip';
import { TelephonyCallController } from '../controller/TelephonyCallController';
import { ITelephonyCallDelegate } from '../service/ITelephonyCallDelegate';
import { ITelephonyAccountDelegate } from '../service/ITelephonyAccountDelegate';
import { TelephonyCallInfo } from '../types';

class TelephonyAccountController implements IRTCAccountDelegate {
  private _telephonyAccountDelegate: ITelephonyAccountDelegate;
  private _telephonyCallDelegate: TelephonyCallController;
  private _rtcAccount: RTCAccount;
  private _callDelegate: ITelephonyCallDelegate;

  constructor(
    rtcEngine: RTCEngine,
    delegate: ITelephonyAccountDelegate,
    callDelegate: ITelephonyCallDelegate,
  ) {
    this._rtcAccount = rtcEngine.createAccount(this);
    this._telephonyAccountDelegate = delegate;
    this._rtcAccount.handleProvisioning();
    this._callDelegate = callDelegate;
  }

  makeCall(toNumber: string) {
    this._telephonyCallDelegate = new TelephonyCallController(
      this._callDelegate,
    );
    return this._rtcAccount.makeCall(toNumber, this._telephonyCallDelegate);
  }

  hangUp(callId: string) {
    // So far only need to support one call. By design, we should get call controller according callID.
    this._telephonyCallDelegate.hangUp();
  }

  mute(callId: string) {
    this._telephonyCallDelegate.mute();
  }

  unmute(callId: string) {
    this._telephonyCallDelegate.unmute();
  }

  hold(callId: string) {
    this._telephonyCallDelegate.hold();
  }

  unhold(callId: string) {
    this._telephonyCallDelegate.unhold();
  }

  startRecord(callId: string) {
    this._telephonyCallDelegate.startRecord();
  }

  stopRecord(callId: string) {
    this._telephonyCallDelegate.stopRecord();
  }

  dtmf(callId: string, digits: string) {
    this._telephonyCallDelegate.dtmf(digits);
  }

  answer(callId: string) {
    this._telephonyCallDelegate.answer();
  }

  sendToVoiceMail(callId: string) {
    this._telephonyCallDelegate.sendToVoiceMail();
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

  async onReceiveIncomingCall(call: RTCCall) {
    this._telephonyCallDelegate = new TelephonyCallController(
      this._callDelegate,
    );
    this._telephonyCallDelegate.setRtcCall(call);
    call.setCallDelegate(this._telephonyCallDelegate);
    const callInfo = await this._buildCallInfo(call.getCallInfo());
    this._telephonyAccountDelegate.onReceiveIncomingCall(callInfo);
  }

  getCallCount() {
    return this._rtcAccount.callCount();
  }

  onReceiveNewProvFlags(sipFlags: RTCSipFlags) {}

  logout() {
    this._rtcAccount.logout();
  }
}

export { TelephonyAccountController };
