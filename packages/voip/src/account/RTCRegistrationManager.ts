/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-27 11:15:01
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCRegistrationFSM } from './RTCRegistrationFSM';
import { IRTCRegistrationFsmDependency } from './IRTCRegistrationFsmDependency';
import { EventEmitter2 } from 'eventemitter2';
import { IRTCUserAgent } from '../signaling/IRTCUserAgent';
import { RTCSipUserAgent } from '../signaling/RTCSipUserAgent';
import {
  RTC_ACCOUNT_STATE,
  RTCCallOptions,
  RTCUserAgentInfo,
} from '../api/types';
import { UA_EVENT, ProvisionDataOptions } from '../signaling/types';
import { IRTCCallDelegate } from '../api/IRTCCallDelegate';
import {
  REGISTRATION_ERROR_CODE,
  REGISTRATION_EVENT,
  REGISTRATION_FSM_NOTIFY,
  RTCRegisterAsyncTask,
  RTCSipProvisionInfo,
} from './types';
import async, { AsyncQueue } from 'async';
import { rtcLogger } from '../utils/RTCLoggerProxy';

const LOG_TAG = 'RTCRegistrationManager';
const registerRetryMinValue = 30;
const registerRetryValueFloatRange = 31;
class RTCRegistrationManager extends EventEmitter2
  implements IRTCRegistrationFsmDependency {
  private _fsm: RTCRegistrationFSM;
  private _eventQueue: AsyncQueue<RTCRegisterAsyncTask>;
  private _userAgent: IRTCUserAgent;
  private _retryTimer: NodeJS.Timeout | null = null;
  private _retryInterval: number;
  private _userAgentInfo: RTCUserAgentInfo;

  onNetworkChangeToOnlineAction(): void {
    this.reRegister();
  }

  public onReRegisterAction(): void {
    if (this._userAgent) {
      this._userAgent.reRegister();
    }
  }

  public onProvisionReadyAction(
    provisionData: RTCSipProvisionInfo,
    options: ProvisionDataOptions,
  ): void {
    this._restartUA(provisionData, options);
  }

  public onUnregisterAction() {
    if (this._userAgent) {
      this._userAgent.unregister();
    }
    this.emit(REGISTRATION_EVENT.LOGOUT_ACTION);
  }

  public onReceiveIncomingInviteAction(callSession: any) {
    this.emit(REGISTRATION_EVENT.RECEIVE_INCOMING_INVITE, callSession);
  }

  constructor(userAgentInfo: RTCUserAgentInfo) {
    super();
    if (userAgentInfo) {
      this._userAgentInfo = userAgentInfo;
    }
    this._fsm = new RTCRegistrationFSM(this);
    this._userAgent = new RTCSipUserAgent();
    this._eventQueue = async.queue(
      (task: RTCRegisterAsyncTask, callback: any) => {
        callback(task.data);
      },
    );
    this._initUserAgentListener();
    this._initFsmObserve();
  }

  private _onEnterReady() {
    this._clearRegisterRetryTimer();
    this.emit(
      REGISTRATION_EVENT.ACCOUNT_STATE_CHANGED,
      RTC_ACCOUNT_STATE.REGISTERED,
    );
  }

  private _onEnterRegInProgress() {
    this.emit(
      REGISTRATION_EVENT.ACCOUNT_STATE_CHANGED,
      RTC_ACCOUNT_STATE.IN_PROGRESS,
    );
  }

  private _onEnterRegFailure() {
    this._scheduleRegisterRetryTimer();
    this.emit(
      REGISTRATION_EVENT.ACCOUNT_STATE_CHANGED,
      RTC_ACCOUNT_STATE.FAILED,
    );
  }

  private _onEnterUnRegistered() {
    this.emit(
      REGISTRATION_EVENT.ACCOUNT_STATE_CHANGED,
      RTC_ACCOUNT_STATE.UNREGISTERED,
    );
  }

  private _initFsmObserve() {
    this._fsm.observe(REGISTRATION_FSM_NOTIFY.REG_IN_PROGRESS, () => {
      this._onEnterRegInProgress();
    });
    this._fsm.observe(REGISTRATION_FSM_NOTIFY.READY, () => {
      this._onEnterReady();
    });
    this._fsm.observe(REGISTRATION_FSM_NOTIFY.REG_FAILURE, () => {
      this._onEnterRegFailure();
    });
    this._fsm.observe(REGISTRATION_FSM_NOTIFY.UN_REGISTERED, () => {
      this._onEnterUnRegistered();
    });
  }

  private _initUserAgentListener() {
    this._userAgent.on(UA_EVENT.REG_SUCCESS, () => {
      this._onUARegSuccess();
    });
    this._userAgent.on(UA_EVENT.REG_FAILED, (response: any, cause: any) => {
      this._onUARegFailed(response, cause);
    });
    this._userAgent.on(UA_EVENT.RECEIVE_INVITE, (session: any) => {
      this._onUAReceiveInvite(session);
    });
    this._userAgent.on(UA_EVENT.REG_UNREGISTER, () => {
      this._onUADeRegister();
    });
    this._userAgent.on(UA_EVENT.TRANSPORT_ERROR, () => {
      this._onUATransportError();
    });
  }

  public provisionReady(provisionData: any, provisionOptions: any) {
    this._eventQueue.push(
      {
        name: REGISTRATION_EVENT.PROVISION_READY,
        data: {
          provData: provisionData,
          provOptions: provisionOptions,
        },
      },
      (data?: any) => {
        this._fsm.provisionReady(data.provData, data.provOptions);
      },
    );
  }

  public reRegister() {
    this._eventQueue.push({ name: REGISTRATION_EVENT.RE_REGISTER }, () => {
      this._fsm.reRegister();
    });
  }

  public makeCall(
    to: string,
    delegate: IRTCCallDelegate,
    options: RTCCallOptions,
  ) {
    this._eventQueue.push(
      {
        name: REGISTRATION_EVENT.MAKE_OUTGOING_CALL_TASK,
        data: {
          toNumber: to,
          callDelegate: delegate,
          callOptions: options,
        },
      },
      (data?: any) => {
        this._fsm.makeOutgoingCall(
          data.toNumber,
          data.callDelegate,
          data.callOptions,
        );
      },
    );
  }

  networkChangeToOnline() {
    this._eventQueue.push(
      { name: REGISTRATION_EVENT.NETWORK_CHANGE_TO_ONLINE },
      () => {
        this._fsm.networkChangeToOnline();
      },
    );
  }

  public createOutgoingCallSession(
    phoneNumber: string,
    options: RTCCallOptions,
  ): any {
    return this._userAgent.makeCall(phoneNumber, options);
  }

  public logout() {
    this._eventQueue.push(
      {
        name: REGISTRATION_EVENT.LOGOUT,
      },
      () => {
        this._fsm.unregister();
      },
    );
  }

  private _onUARegSuccess() {
    this._eventQueue.push(
      { name: REGISTRATION_EVENT.UA_REGISTER_SUCCESS },
      () => {
        this._fsm.regSuccess();
      },
    );
  }

  private _onUADeRegister() {
    this._eventQueue.push({ name: REGISTRATION_EVENT.UA_UNREGISTERED }, () => {
      this._fsm.unregister();
    });
  }

  private _onUARegFailed(response?: any, cause?: any) {
    if (
      response &&
      response.status_code &&
      (REGISTRATION_ERROR_CODE.FORBIDDEN === response.status_code ||
        REGISTRATION_ERROR_CODE.UNAUTHORIZED === response.status_code ||
        REGISTRATION_ERROR_CODE.PROXY_AUTHENTICATION_REQUIRED ===
          response.status_code)
    ) {
      this.emit(REGISTRATION_EVENT.REFRESH_PROV);
    }
    this._eventQueue.push(
      { name: REGISTRATION_EVENT.UA_REGISTER_FAILED },
      () => {
        this._fsm.regFailed();
      },
    );
  }

  private _onUATransportError() {
    this._eventQueue.push(
      { name: REGISTRATION_EVENT.UA_TRANSPORT_ERROR },
      () => {
        this._fsm.transportError();
      },
    );
  }

  private _onUAReceiveInvite(session: any) {
    this._fsm.receiveIncomingInvite(session);
  }

  private _scheduleRegisterRetryTimer() {
    this._calculateNextRetryInterval();
    rtcLogger.debug(
      LOG_TAG,
      `Schedule retry registration in ${this._retryInterval} seconds`,
    );
    if (this._retryTimer) {
      clearTimeout(this._retryTimer);
    }
    this._retryTimer = setTimeout(() => {
      this.reRegister();
    },                            this._retryInterval * 1000);
  }

  private _clearRegisterRetryTimer() {
    rtcLogger.debug(LOG_TAG, 'Clear retry registration timer');
    if (this._retryTimer) {
      clearTimeout(this._retryTimer);
    }
    this._retryTimer = null;
  }

  private _calculateNextRetryInterval() {
    this._retryInterval =
      registerRetryMinValue +
      Math.floor(Math.random() * registerRetryValueFloatRange);
  }

  private _restartUA(
    provisionData: RTCSipProvisionInfo,
    options: ProvisionDataOptions,
  ) {
    if (this._userAgentInfo) {
      if (
        this._userAgentInfo.endpointId &&
        this._userAgentInfo.endpointId.length > 0
      ) {
        options.uuid = this._userAgentInfo.endpointId;
      }
      if (
        this._userAgentInfo.userAgent &&
        this._userAgentInfo.userAgent.length > 0
      ) {
        options.appName = this._userAgentInfo.userAgent;
      }
    }
    this._userAgent.restartUA(provisionData, options);
  }
}

export { RTCRegistrationManager };
