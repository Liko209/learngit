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
import { RTC_ACCOUNT_STATE, RTCCallOptions, RTCUserInfo } from '../api/types';
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
import _ from 'lodash';
import { randomBetween } from '../utils/utils';
import { kRetryIntervalList } from './constants';

const LOG_TAG = 'RTCRegistrationManager';
class RTCRegistrationManager extends EventEmitter2
  implements IRTCRegistrationFsmDependency {
  private _fsm: RTCRegistrationFSM;
  private _eventQueue: AsyncQueue<RTCRegisterAsyncTask>;
  private _userAgent: IRTCUserAgent;
  private _retryTimer: NodeJS.Timeout | null = null;
  private _failedTimes: number = 0;
  private _userInfo: RTCUserInfo;

  onNetworkChangeToOnlineAction(): void {
    this.reRegister();
  }

  public onReRegisterAction(forceToMainProxy: boolean): void {
    if (this._userAgent) {
      this._userAgent.reRegister(forceToMainProxy);
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

  public onSwitchBackProxyAction() {
    this.emit(REGISTRATION_EVENT.SWITCH_BACK_PROXY_ACTION);
  }

  constructor(userInfo: RTCUserInfo) {
    super();
    if (userInfo) {
      this._userInfo = userInfo;
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
    this._failedTimes = 0;
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
    this._userAgent.on(UA_EVENT.SWITCH_BACK_PROXY, () => {
      this._onUASwitchBackProxy();
    });
    this._userAgent.on(UA_EVENT.PROVISION_UPDATE, () => {
      this._onUAProvisionUpdate();
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

  public reRegister(forceToMainProxy: boolean = false) {
    this._eventQueue.push(
      {
        name: REGISTRATION_EVENT.RE_REGISTER,
        data: {
          forceToMain: forceToMainProxy,
        },
      },
      (data?: any) => {
        this._fsm.reRegister(data.forceToMain);
      },
    );
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

  private _onUASwitchBackProxy() {
    this._eventQueue.push(
      { name: REGISTRATION_EVENT.UA_SWITCH_BACK_PROXY },
      () => {
        this._fsm.switchBackProxy();
      },
    );
  }

  private _onUAProvisionUpdate() {
    this.emit(REGISTRATION_EVENT.REFRESH_PROV);
  }

  private _onUAReceiveInvite(session: any) {
    this._fsm.receiveIncomingInvite(session);
  }

  private _scheduleRegisterRetryTimer() {
    const interval = this._calculateNextRetryInterval();
    rtcLogger.debug(
      LOG_TAG,
      `Schedule retry registration in ${interval} seconds`,
    );
    if (this._retryTimer) {
      clearTimeout(this._retryTimer);
    }
    this._retryTimer = setTimeout(() => {
      this.reRegister();
    },                            interval * 1000);
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
    this._failedTimes++;
    return randomBetween(
      kRetryIntervalList[index].min,
      kRetryIntervalList[index].max,
    );
  }

  private _restartUA(
    provisionData: RTCSipProvisionInfo,
    options: ProvisionDataOptions,
  ) {
    const cloneOption = _.cloneDeep(options);
    if (this._userInfo) {
      if (this._userInfo.endpointId && this._userInfo.endpointId.length > 0) {
        cloneOption.uuid = this._userInfo.endpointId;
      }
      if (this._userInfo.userAgent && this._userInfo.userAgent.length > 0) {
        cloneOption.appName = this._userInfo.userAgent;
      }
    }
    this._userAgent.restartUA(provisionData, cloneOption);
  }
}

export { RTCRegistrationManager };
