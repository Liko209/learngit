/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2018-12-06 13:12:30
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCRegistrationManager } from '../account/RTCRegistrationManager';
import { IRTCAccountDelegate } from './IRTCAccountDelegate';
import { IRTCAccount } from '../account/IRTCAccount';
import { RTCCall } from './RTCCall';
import { kRTCAnonymous } from '../account/constants';

import { IRTCCallDelegate } from './IRTCCallDelegate';
import {
  REGISTRATION_EVENT,
  RTCSipProvisionInfo,
  RTC_PROV_EVENT,
} from '../account/types';
import { RTC_ACCOUNT_STATE, RTCCallOptions } from './types';
import { RTCProvManager } from '../account/RTCProvManager';
import { RTCCallManager } from '../account/RTCCallManager';
import { rtcLogger } from '../utils/RTCLoggerProxy';
import { RTCNetworkNotificationCenter } from '../utils/RTCNetworkNotificationCenter';
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
  maxReconnectionAttempts: '0',
  reconnectionTimeout: '5',
  connectionTimeout: '5',
};

const LOG_TAG = 'RTCAccount';

class RTCAccount implements IRTCAccount {
  private _regManager: RTCRegistrationManager;
  private _delegate: IRTCAccountDelegate;
  private _state: RTC_ACCOUNT_STATE;
  private _provManager: RTCProvManager;
  private _callManager: RTCCallManager;
  private _networkListener: Listener;

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
    RTCNetworkNotificationCenter.instance().removeListener(
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
    options?: RTCCallOptions,
  ) {
    if (toNumber.length === 0) {
      rtcLogger.error(LOG_TAG, 'Failed to make call. To number is empty');
      return;
    }
    let callOption: RTCCallOptions;
    if (options) {
      callOption = options;
    } else {
      callOption = {};
    }
    this._regManager.makeCall(toNumber, delegate, callOption);
  }

  public makeAnonymousCall(
    toNumber: string,
    delegate: IRTCCallDelegate,
    options?: RTCCallOptions,
  ) {
    let optionsWithAnonymous: RTCCallOptions;
    if (options) {
      optionsWithAnonymous = options;
      optionsWithAnonymous.fromNumber = kRTCAnonymous;
    } else {
      optionsWithAnonymous = { fromNumber: kRTCAnonymous };
    }
    rtcLogger.error(LOG_TAG, 'make anonymous call');
    this.makeCall(toNumber, delegate, optionsWithAnonymous);
  }

  isReady(): boolean {
    return this._state === RTC_ACCOUNT_STATE.REGISTERED;
  }

  state(): RTC_ACCOUNT_STATE {
    return this._state;
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

  logout() {
    this._regManager.logout();
  }

  createOutgoingCallSession(toNum: string, options: RTCCallOptions): any {
    return this._regManager.createOutgoingCallSession(toNum, options);
  }

  removeCallFromCallManager(uuid: string): void {
    this._callManager.removeCall(uuid);
  }

  private _initListener() {
    this._regManager.on(
      REGISTRATION_EVENT.MAKE_OUTGOING_CALL,
      (
        toNumber: string,
        delegate: IRTCCallDelegate,
        options: RTCCallOptions,
      ) => {
        this._onMakeOutgoingCall(toNumber, delegate, options);
      },
    );
    this._regManager.on(
      REGISTRATION_EVENT.RECEIVE_INCOMING_INVITE,
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

    this._regManager.on(REGISTRATION_EVENT.LOGOUT_ACTION, () => {
      this._onLogoutAction();
    });

    this._provManager.on(RTC_PROV_EVENT.NEW_PROV, ({ info }) => {
      this._onNewProv(info);
    });

    RTCNetworkNotificationCenter.instance().on(
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

  private _onLogoutAction() {
    this._callManager.endAllCalls();
    this._provManager.clearProvInfo();
  }

  private _onMakeOutgoingCall(
    toNumber: string,
    delegate: IRTCCallDelegate,
    options: RTCCallOptions,
  ) {
    if (!this._callManager.allowCall()) {
      rtcLogger.warn(LOG_TAG, 'Failed to make call. Max call count reached');
      return;
    }
    const call = new RTCCall(false, toNumber, null, this, delegate, options);
    this._callManager.addCall(call);
    if (this._delegate) {
      this._delegate.onMadeOutgoingCall(call);
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
    this._regManager.provisionReady(sipProv, options);
  }

  private _onNetworkChange(params: any) {
    if (RTC_NETWORK_STATE.ONLINE === params.state) {
      this._regManager.networkChangeToOnline();
    }
  }
}

export { RTCAccount };
