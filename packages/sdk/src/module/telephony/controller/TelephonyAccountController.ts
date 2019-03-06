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
} from 'voip';
import { TelephonyCallController } from '../controller/TelephonyCallController';
import { ITelephonyCallDelegate } from '../service/ITelephonyCallDelegate';
import { ITelephonyAccountDelegate } from '../service/ITelephonyAccountDelegate';

class TelephonyAccountController implements IRTCAccountDelegate {
  private _delegate: ITelephonyAccountDelegate;
  private _callController: TelephonyCallController;
  private _rtcAccount: RTCAccount;

  constructor(rtcEngine: RTCEngine, delegate: ITelephonyAccountDelegate) {
    this._rtcAccount = rtcEngine.createAccount(this);
    this._delegate = delegate;
    this._rtcAccount.handleProvisioning();
  }

  makeCall(toNumber: string, delegate: ITelephonyCallDelegate) {
    this._callController = new TelephonyCallController(delegate);
    this._rtcAccount.makeCall(toNumber, this._callController);
  }

  hangUp(callId: string) {
    // So far only need to support one call. By design, we should get call controller according callID.
    this._callController.hangUp();
  }

  onAccountStateChanged(state: RTC_ACCOUNT_STATE) {
    this._delegate.onAccountStateChanged(state);
  }

  onMadeOutgoingCall(call: RTCCall) {
    this._callController.setRtcCall(call);
  }

  onReceiveIncomingCall(call: RTCCall) {}

  onReceiveNewProvFlags(sipFlags: object) {}
}

export { TelephonyAccountController };
