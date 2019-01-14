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
import { RTCCallManager } from '../account/RTCCallManager';
import { rtcLogger } from '../utils/RTCLoggerProxy';

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
  private _kTag: string = 'RTCAccount';
  private _regManager: RTCRegistrationManager;
  private _delegate: IRTCAccountDelegate;
  private _state: RTC_ACCOUNT_STATE;
  private _provManager: RTCProvManager;
  private _callManager: RTCCallManager;

  constructor(listener: IRTCAccountDelegate) {
    this._state = RTC_ACCOUNT_STATE.IDLE;
    this._delegate = listener;
    this._regManager = new RTCRegistrationManager();
    this._provManager = new RTCProvManager();
    this._callManager = new RTCCallManager();
    this._initListener();
  }

  public handleProvisioning() {
    this._provManager.acquireSipProv();
  }

  public makeCall(toNumber: string, delegate: IRTCCallDelegate): RTCCall {
    if (toNumber.length === 0) {
      rtcLogger.error(this._kTag, 'Failed to make call. To number is empty');
      return null as any;
    }
    if (!this._callManager.allowCall()) {
      rtcLogger.warn(this._kTag, 'Failed to make call. Max call count reached');
      return null as any;
    }
    const call = new RTCCall(false, toNumber, null, this, delegate);
    this._callManager.addCall(call);
    return call;
  }

  isReady(): boolean {
    return this._state === RTC_ACCOUNT_STATE.REGISTERED;
  }

  callList(): RTCCall[] {
    return this._callManager.callList();
  }

  callCount(): number {
    return this._callManager.callCount();
  }

  getCallByUuid(uuid: string): RTCCall {
    return this._callManager.getCallByUuid(uuid);
  }

  createOutgoingCallSession(toNum: string): any {
    return this._regManager.createOutgoingCallSession(toNum, {});
  }

  removeCallFromCallManager(uuid: string): void {
    this._callManager.removeCall(uuid);
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
    if (session === null) {
      rtcLogger.error(
        this._kTag,
        'Failed to receive incoming call. Session is null',
      );
      return;
    }
    if (!this._callManager.allowCall()) {
      rtcLogger.warn(
        this._kTag,
        'Failed to receive incoming call. Max call count is reached',
      );
      return;
    }
    const call = new RTCCall(true, '', session, this, null);
    this._callManager.addCall(call);
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
