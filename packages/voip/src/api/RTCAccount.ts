/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2018-12-06 13:12:30
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCRegistrationManager } from '../account/RTCRegistrationManager';
import { IRTCAccountDelegate } from './IRTCAccountDelegate';
import { IRTCAccount } from '../account/IRTCAccount';
import { RTCCall } from './RTCCall';
import { IRTCCallDelegate } from './IRTCCallDelegate';
import {
  REGISTRATION_EVENT,
  RTCSipProvisionInfo,
  RTC_PROV_EVENT,
} from '../account/types';
import { rtcMediaManager } from '../utils/RTCMediaManager';
import { v4 as uuid } from 'uuid';
import { RTC_ACCOUNT_STATE } from './types';
import { RTCProvManager } from '../account/RTCProvManager';

const options = {
  appKey: 'YCWFuqW8T7-GtSTb6KBS6g',
  appName: 'RingCentral',
  appVersion: '0.1.0',
  endPointId: 'FVKGRbLRTxGxPempqg5f9g',
  audioHelper: {
    enabled: true,
  },
  logLevel: 10,
};

class RTCAccount implements IRTCAccount {
  private _regManager: RTCRegistrationManager;
  private _delegate: IRTCAccountDelegate;
  private _state: RTC_ACCOUNT_STATE;
  private _provManager: RTCProvManager;

  constructor(listener: IRTCAccountDelegate) {
    this._state = RTC_ACCOUNT_STATE.IDLE;
    this._delegate = listener;
    this._regManager = new RTCRegistrationManager();
    this._provManager = new RTCProvManager();
    this._initListener();
  }

  public handleProvisioning() {
    this._provManager.acquireSipProv();
  }

  public makeCall(toNumber: string, delegate: IRTCCallDelegate): RTCCall {
    const call = new RTCCall(false, toNumber, null, this, delegate);
    return call;
  }

  isReady(): boolean {
    return this._state === RTC_ACCOUNT_STATE.REGISTERED;
  }

  createOutCallSession(toNum: string): any {
    return this._regManager.createOutgoingCallSession(toNum, {});
  }

  private _initListener() {
    this._regManager.on(
      REGISTRATION_EVENT.RECEIVER_INCOMING_SESSION,
      (session: any) => {
        this._onReceiveInvite(session);
      },
    );
    this._regManager.on(
      REGISTRATION_EVENT.ACCOUNT_STATE_CHANGED,
      (state: RTC_ACCOUNT_STATE) => {
        this._onAccountStateChanged(state);
      },
    );
    this._provManager.on(RTC_PROV_EVENT.NEW_PROV, ({ info }) => {
      this._onNewProv(info);
    });
  }

  private _onAccountStateChanged(state: RTC_ACCOUNT_STATE) {
    if (this._state === state) {
      return;
    }
    this._state = state;
    if (this._delegate) {
      this._delegate.onAccountStateChanged(state);
    }
  }

  private _onReceiveInvite(session: any) {
    const call = new RTCCall(true, '', session, this, null);
    this._delegate.onReceiveIncomingCall(call);
  }

  private _onNewProv(sipProv: RTCSipProvisionInfo) {
    if (!this._regManager) {
      return;
    }
    const info = {
      appKey: options.appKey,
      appName: options.appName,
      appVersion: options.appVersion,
      endPointId: uuid(),
      audioHelper: options.audioHelper,
      logLevel: options.logLevel,
      media: {
        remote: rtcMediaManager.getRemoteAudio(),
        local: rtcMediaManager.getLocalAudio(),
      },
    };
    this._regManager.provisionReady(sipProv, info);
  }
}

export { RTCAccount };
