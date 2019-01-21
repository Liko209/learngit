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
import { RTC_ACCOUNT_STATE, RTCCallOptions } from './types';
import { RTCProvManager } from '../account/RTCProvManager';
import { RTCCallManager } from '../account/RTCCallManager';
import { rtcLogger } from '../utils/RTCLoggerProxy';
import { rtcNetworkNotificationCenter } from '../utils/RTCNetworkNotificationCenter';
import { RTC_NETWORK_EVENT, RTC_NETWORK_STATE } from '../utils/types';
import { Listener } from 'eventemitter2';

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

const LOG_TAG = 'RTCAccount';

class RTCAccount implements IRTCAccount {
  private _regManager: RTCRegistrationManager;
  private _delegate: IRTCAccountDelegate;
  private _state: RTC_ACCOUNT_STATE;
  private _provManager: RTCProvManager;
  private _callManager: RTCCallManager;
  private _networkListener: Listener;
  private _isAnonymous: boolean = false;

  constructor(listener: IRTCAccountDelegate) {
    this._state = RTC_ACCOUNT_STATE.IDLE;
    this._delegate = listener;
    this._regManager = new RTCRegistrationManager();
    this._provManager = new RTCProvManager();
    this._callManager = new RTCCallManager();
    this._networkListener = (params: any) => {
      this._onNetworkChange(params);
    };
    this._initListener();
  }

  destroy() {
    rtcNetworkNotificationCenter.removeListener(
      RTC_NETWORK_EVENT.NETWORK_CHANGE,
      this._networkListener,
    );
  }

  public handleProvisioning() {
    this._provManager.acquireSipProv();
  }

  public makeCall(
    toNumber: string,
    delegate: IRTCCallDelegate,
  ): RTCCall | null {
    if (toNumber.length === 0) {
      rtcLogger.error(LOG_TAG, 'Failed to make call. To number is empty');
      return null;
    }
    if (!this._callManager.allowCall()) {
      rtcLogger.warn(LOG_TAG, 'Failed to make call. Max call count reached');
      return null;
    }
    const call = new RTCCall(false, toNumber, null, this, delegate);
    this._callManager.addCall(call);
    return call;
  }

  public makeAnonymousCall(
    toNumber: string,
    delegate: IRTCCallDelegate,
  ): RTCCall | null {
    this._isAnonymous = true;
    return this.makeCall(toNumber, delegate);
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

  getCallByUuid(uuid: string): RTCCall | null {
    return this._callManager.getCallByUuid(uuid);
  }

  createOutgoingCallSession(toNum: string): any {
    const AnonymousOptions: RTCCallOptions = { anonymous: true };
    return this._isAnonymous
      ? this._regManager.createOutgoingCallSession(toNum, AnonymousOptions)
      : this._regManager.createOutgoingCallSession(toNum, {});
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

    rtcNetworkNotificationCenter.on(
      RTC_NETWORK_EVENT.NETWORK_CHANGE,
      this._networkListener,
    );
  }

  private _onAccountStateChanged(state: RTC_ACCOUNT_STATE) {
    if (this._state === state) {
      return;
    }
    this._state = state;
    if (this._state === RTC_ACCOUNT_STATE.REGISTERED) {
      this._callManager.notifyAccountReady();
    }
    if (this._delegate) {
      this._delegate.onAccountStateChanged(state);
    }
  }

  private _onReceiveInvite(session: any) {
    if (session === null) {
      rtcLogger.error(
        LOG_TAG,
        'Failed to receive incoming call. Session is null',
      );
      return;
    }
    if (!this._callManager.allowCall()) {
      rtcLogger.warn(
        LOG_TAG,
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

  private _onNetworkChange(params: any) {
    if (RTC_NETWORK_STATE.ONLINE === params.state) {
      this._regManager.networkChangeToOnline();
    }
  }
}

export { RTCAccount };
