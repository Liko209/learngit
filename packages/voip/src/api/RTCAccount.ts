/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2018-12-06 13:12:30
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCRegistrationManager } from '../account/RTCRegistrationManager';
import { IRTCAccountDelegate } from './IRTCAccountDelegate';
import { IRTCAccount } from '../account/IRTCAccount';
import { RTCCall } from './RTCCall';
import { kRTCAnonymous, kRTCProvisioningOptions } from '../account/constants';

import { IRTCCallDelegate } from './IRTCCallDelegate';
import {
  REGISTRATION_EVENT,
  RTCSipProvisionInfo,
  RTC_PROV_EVENT,
} from '../account/types';
import {
  RTC_ACCOUNT_STATE,
  RTCCallOptions,
  RTCSipFlags,
  RTC_STATUS_CODE,
} from './types';
import { RTCProvManager } from '../account/RTCProvManager';
import { RTCCallManager } from '../account/RTCCallManager';
import { rtcLogger } from '../utils/RTCLoggerProxy';
import { RTCNetworkNotificationCenter } from '../utils/RTCNetworkNotificationCenter';
import { RTC_NETWORK_EVENT, RTC_NETWORK_STATE } from '../utils/types';
import { Listener } from 'eventemitter2';

const LOG_TAG = 'RTCAccount';

class RTCAccount implements IRTCAccount {
  private _regManager: RTCRegistrationManager;
  private _delegate: IRTCAccountDelegate;
  private _state: RTC_ACCOUNT_STATE;
  private _postponeProvisioning: RTCSipProvisionInfo | null;
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

  public clearLocalProvisioning() {
    this._provManager.clearProvInfo();
  }

  public makeCall(
    toNumber: string,
    delegate: IRTCCallDelegate,
    options?: RTCCallOptions,
  ): RTC_STATUS_CODE {
    if (!toNumber || toNumber.length === 0) {
      rtcLogger.error(LOG_TAG, 'Failed to make call. To number is empty');
      return RTC_STATUS_CODE.NUMBER_INVALID;
    }
    if (!this._callManager.allowCall()) {
      rtcLogger.warn(LOG_TAG, 'Failed to make call. Max call count reached');
      return RTC_STATUS_CODE.MAX_CALLS_REACHED;
    }
    if (this.state() === RTC_ACCOUNT_STATE.UNREGISTERED) {
      rtcLogger.warn(
        LOG_TAG,
        'Failed to make call. Account is in Unregistered state',
      );
      return RTC_STATUS_CODE.INVALID_STATE;
    }
    let callOption: RTCCallOptions;
    if (options) {
      callOption = options;
    } else {
      callOption = {};
    }
    this._regManager.makeCall(toNumber, delegate, callOption);
    const call = new RTCCall(false, toNumber, null, this, delegate, callOption);
    this._callManager.addCall(call);
    if (this._delegate) {
      this._delegate.onMadeOutgoingCall(call);
    }
    if (this.isReady()) {
      call.onAccountReady();
    } else {
      call.onAccountNotReady();
    }
    return RTC_STATUS_CODE.OK;
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
    rtcLogger.debug(LOG_TAG, 'make anonymous call');
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
    if (this._callManager.callCount() === 0 && this._postponeProvisioning) {
      rtcLogger.debug(
        LOG_TAG,
        "There's no active call. Process postpone provisioning info",
      );
      this._regManager.provisionReady(
        this._postponeProvisioning,
        kRTCProvisioningOptions,
      );
      this._postponeProvisioning = null;
    }
  }

  private _initListener() {
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

    this._regManager.on(REGISTRATION_EVENT.REFRESH_PROV, () => {
      this._refreshProv();
    });

    this._provManager.on(RTC_PROV_EVENT.NEW_PROV, ({ info }) => {
      this._onNewProv(info);
      this._delegate.onReceiveNewProvFlags(info.sipFlags);
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
      this._provManager.initRefreshState();
    }
    if (this._delegate) {
      this._delegate.onAccountStateChanged(state);
    }
  }

  private _onLogoutAction() {
    this._callManager.endAllCalls();
    this.clearLocalProvisioning();
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
    if (this._callManager.callCount() === 0) {
      rtcLogger.debug(
        LOG_TAG,
        "There's no active call. Process new provisioning info",
      );
      this._regManager.provisionReady(sipProv, kRTCProvisioningOptions);
    } else {
      rtcLogger.debug(
        LOG_TAG,
        "There're active calls. Postpone new provisioning info",
      );
      this._postponeProvisioning = sipProv;
    }
  }

  private _onNetworkChange(params: any) {
    if (RTC_NETWORK_STATE.ONLINE === params.state) {
      this._regManager.networkChangeToOnline();
    }
  }

  getSipProvFlags(): RTCSipFlags | null {
    const SipProvisionInfo = this._provManager.getCurrentSipProvisionInfo();
    if (SipProvisionInfo) {
      return SipProvisionInfo.sipFlags;
    }

    return null;
  }

  private _refreshProv() {
    this._provManager.refreshSipProv();
  }
}

export { RTCAccount };
