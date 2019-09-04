/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2018-12-06 13:12:30
 * Copyright © RingCentral. All rights reserved.
 */
import { Listener } from 'eventemitter2';
import { RTCRegistrationManager } from '../account/RTCRegistrationManager';
import { IRTCAccountDelegate } from './IRTCAccountDelegate';
import { IRTCAccount } from '../account/IRTCAccount';
import { RTCCall } from './RTCCall';
import {
  kRTCProvisioningOptions,
  kRetryIntervalList,
} from '../account/constants';
import { IRTCCallDelegate } from './IRTCCallDelegate';
import {
  REGISTRATION_EVENT,
  RTC_PROV_EVENT,
  ALLOW_CALL_FLAG,
} from '../account/types';
import {
  RTC_ACCOUNT_STATE,
  RTCCallOptions,
  RTCSipFlags,
  RTCUserInfo,
  RTCSipProvisionInfo,
  RTCNoAudioStateEvent,
  RTCNoAudioDataEvent,
} from './types';
import { RTCProvManager } from '../account/RTCProvManager';
import { RTCCallManager } from '../account/RTCCallManager';
import { rtcLogger } from '../utils/RTCLoggerProxy';
import { RTCNetworkNotificationCenter } from '../utils/RTCNetworkNotificationCenter';
import { RTC_NETWORK_EVENT, RTC_NETWORK_STATE } from '../utils/types';
import { randomBetween } from '../utils/utils';

const LOG_TAG = 'RTCAccount';

class RTCAccount implements IRTCAccount {
  private _regManager: RTCRegistrationManager;
  private _delegate: IRTCAccountDelegate;
  private _state: RTC_ACCOUNT_STATE;
  private _postponeProvisioning: RTCSipProvisionInfo | null;
  private _postponeReregister: boolean = false;
  private _provManager: RTCProvManager;
  private _callManager: RTCCallManager;
  private _networkListener: Listener;
  private _userInfo: RTCUserInfo;
  private _retryTimer: NodeJS.Timeout | null = null;
  private _failedTimes: number = 0;

  constructor(listener: IRTCAccountDelegate, userInfo: RTCUserInfo) {
    this._state = RTC_ACCOUNT_STATE.IDLE;
    this._delegate = listener;
    this._regManager = new RTCRegistrationManager(userInfo);
    this._userInfo = userInfo;
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

  handleProvisioning() {
    this._provManager.acquireSipProv();
  }

  clearLocalProvisioning() {
    this._provManager.clearProvInfo();
  }

  makeCall(
    toNumber: string,
    delegate: IRTCCallDelegate,
    options?: RTCCallOptions,
  ): RTCCall | undefined {
    rtcLogger.ensureApiBeenCalledLog(LOG_TAG, 'makeCall');
    if (!toNumber || toNumber.length === 0) {
      rtcLogger.error(LOG_TAG, 'Failed to make call. To number is empty');
      return undefined;
    }
    const allowCallFlag: boolean =
      options && options.extraCall
        ? this._callManager.allowCall(ALLOW_CALL_FLAG.EXTRA_OUTBOUND_CALL)
        : this._callManager.allowCall();
    if (!allowCallFlag) {
      rtcLogger.warn(LOG_TAG, 'Failed to make call. Max call count reached');
      return undefined;
    }
    if (this.state() === RTC_ACCOUNT_STATE.UNREGISTERED) {
      rtcLogger.warn(
        LOG_TAG,
        'Failed to make call. Account is in Unregistered state',
      );
      return undefined;
    }
    let callOption: RTCCallOptions;
    if (options) {
      callOption = options;
    } else {
      callOption = {};
    }
    this._regManager.makeCall(toNumber, delegate, callOption);
    const call = new RTCCall(
      false,
      toNumber,
      null,
      this,
      delegate,
      callOption,
      this._userInfo,
    );
    this._callManager.addCall(call);
    if (this.isReady()) {
      call.onAccountReady();
    } else {
      call.onAccountNotReady();
    }
    return call;
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

  getRegistrationStatusCode(): number {
    return this._regManager.getRegistrationStatusCode();
  }

  logout() {
    this._regManager.logout();
  }

  createOutgoingCallSession(toNum: string, options: RTCCallOptions): any {
    return this._regManager.createOutgoingCallSession(toNum, options);
  }

  removeCallFromCallManager(uuid: string): void {
    this._callManager.removeCall(uuid);
    if (!this._callManager.callCount()) {
      if (this._postponeProvisioning) {
        rtcLogger.debug(
          LOG_TAG,
          "There's no active call. Process postpone provisioning info",
        );
        this._regManager.provisionReady(
          this._postponeProvisioning,
          kRTCProvisioningOptions,
        );
        this._postponeProvisioning = null;
      } else if (this._postponeReregister) {
        rtcLogger.debug(
          LOG_TAG,
          "There's no active call. Process postpone re-register",
        );
        this._postponeReregister = false;
        this._reRegister();
      }
    }
  }

  notifyNoAudioStateEvent(
    uuid: string,
    noAudioStateEvent: RTCNoAudioStateEvent,
  ) {
    this._delegate &&
      this._delegate.onNoAudioStateEvent(uuid, noAudioStateEvent);
  }

  notifyNoAudioDataEvent(uuid: string, noAudioDataEvent: RTCNoAudioDataEvent) {
    this._delegate && this._delegate.onNoAudioDataEvent(uuid, noAudioDataEvent);
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
    this._regManager.on(REGISTRATION_EVENT.SWITCH_BACK_PROXY_ACTION, () => {
      this._switchBackProxy();
    });
    this._provManager.on(
      RTC_PROV_EVENT.PROV_ARRIVE,
      (newSipProv, oldSipProv) => {
        this._delegate.onReceiveSipProv(newSipProv, oldSipProv);
      },
    );
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
      this._failedTimes = 0;
      this._clearRegisterRetryTimer();
      this._callManager.notifyAccountReady();
      this._provManager.initRefreshState();
    } else if (this._state === RTC_ACCOUNT_STATE.FAILED) {
      this._scheduleRegisterRetryTimer();
    }
    window['sipState'] = state;
    if (this._delegate) {
      this._delegate.onAccountStateChanged(state);
    }
  }

  private _scheduleRegisterRetryTimer() {
    const interval = this._calculateNextRetryInterval();
    this._failedTimes++;
    rtcLogger.debug(
      LOG_TAG,
      `Schedule retry registration in ${interval} seconds`,
    );
    if (this._retryTimer) {
      clearTimeout(this._retryTimer);
    }
    this._retryTimer = setTimeout(() => {
      rtcLogger.debug(LOG_TAG, 'retry timer is reached and do reRegister');
      this._reRegister();
    }, interval * 1000);
  }

  private _clearRegisterRetryTimer() {
    rtcLogger.debug(LOG_TAG, 'Clear retry registration timer');
    if (this._retryTimer) {
      clearTimeout(this._retryTimer);
    }
    this._retryTimer = null;
  }

  private _calculateNextRetryInterval(): number {
    const index =
      this._failedTimes < kRetryIntervalList.length
        ? this._failedTimes
        : kRetryIntervalList.length - 1;
    return randomBetween(
      kRetryIntervalList[index].min,
      kRetryIntervalList[index].max,
    );
  }

  private _reRegister() {
    if (this.callCount()) {
      rtcLogger.debug(LOG_TAG, "There're active calls. Postpone Re-register");
      this._postponeReregister = true;
    } else {
      rtcLogger.debug(LOG_TAG, 'Reregister');
      this._regManager.reRegister();
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
    if (!this._callManager.allowCall(ALLOW_CALL_FLAG.INBOUND_CALL)) {
      rtcLogger.warn(
        LOG_TAG,
        'Failed to receive incoming call. Max call count is reached',
      );
      return;
    }
    const call = new RTCCall(
      true,
      '',
      session,
      this,
      null,
      undefined,
      this._userInfo,
    );
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
      rtcLogger.debug(LOG_TAG, 'network change to online and do reRegister');
      this._reRegister();
    }
  }

  getSipProvFlags(): RTCSipFlags | null {
    const sipProvisionInfo = this._provManager.getCurrentSipProvisionInfo();
    if (sipProvisionInfo) {
      return sipProvisionInfo.sipFlags;
    }

    return null;
  }

  getSipProv(): RTCSipProvisionInfo | null {
    const sipProvisionInfo = this._provManager.getCurrentSipProvisionInfo();
    if (sipProvisionInfo) {
      return sipProvisionInfo;
    }

    return null;
  }

  private _refreshProv() {
    this._provManager.refreshSipProv();
  }

  private _switchBackProxy() {
    rtcLogger.debug(LOG_TAG, 'switch to back proxy and do reRegister');
    this._reRegister();
  }
}

export { RTCAccount };
