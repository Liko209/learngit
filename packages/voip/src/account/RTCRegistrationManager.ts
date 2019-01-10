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
import { RTC_ACCOUNT_STATE } from '../api/types';
import { UA_EVENT } from '../signaling/types';
import {
  REGISTRATION_ERROR_CODE,
  REGISTRATION_EVENT,
  REGISTRATION_FSM_NOTIFY,
} from './types';
import async from 'async';

class RTCRegistrationManager extends EventEmitter2
  implements IRTCRegistrationFsmDependency {
  private _fsm: RTCRegistrationFSM;
  private _eventQueue: any;
  private _userAgent: IRTCUserAgent;

  public onRegistrationAction(): void {}

  public onReRegisterAction(): void {
    this._userAgent.reRegister();
  }

  public onProvisionReadyAction(provisionData: any, options: any): void {
    this._userAgent = new RTCSipUserAgent(provisionData, options);
    this._initUserAgentListener();
  }

  constructor() {
    super();
    this._fsm = new RTCRegistrationFSM(this);
    this._eventQueue = async.queue((task: any, callback: any) => {
      switch (task.name) {
        case REGISTRATION_EVENT.PROVISION_READY: {
          this._fsm.provisionReady(task.data, task.options);
          break;
        }
        case REGISTRATION_EVENT.RE_REGISTER: {
          this._fsm.reRegister();
          break;
        }
        case REGISTRATION_EVENT.UA_REGISTER_SUCCESS: {
          this._fsm.regSuccess();
          break;
        }
        case REGISTRATION_EVENT.UA_REGISTER_FAILED: {
          this._fsm.regFailed();
          break;
        }
        case REGISTRATION_EVENT.UA_REGISTER_TIMEOUT: {
          this._fsm.regTimeout();
          break;
        }
        case REGISTRATION_EVENT.UA_UNREGISTERED: {
          this._fsm.unregister();
          break;
        }
        default:
          break;
      }
      callback();
    });
    this._initFsmObserve();
  }

  private _onEnterReady() {
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
  }

  public provisionReady(provisionData: any, provisionOptions: any) {
    this._eventQueue.push(
      {
        name: REGISTRATION_EVENT.PROVISION_READY,
        data: provisionData,
        options: provisionOptions,
      },
      () => {},
    );
  }

  public reRegister() {
    this._eventQueue.push({ name: REGISTRATION_EVENT.RE_REGISTER }, () => {});
  }

  public createOutgoingCallSession(phoneNumber: string, options: any): any {
    return this._userAgent.makeCall(phoneNumber, options);
  }

  private _onUARegSuccess() {
    this._eventQueue.push(
      { name: REGISTRATION_EVENT.UA_REGISTER_SUCCESS },
      () => {},
    );
  }

  private _onUADeRegister() {
    this._eventQueue.push(
      { name: REGISTRATION_EVENT.UA_UNREGISTERED },
      () => {},
    );
  }

  private _onUARegFailed(response: any, cause: any) {
    if (REGISTRATION_ERROR_CODE.TIME_OUT === cause) {
      this._eventQueue.push(
        { name: REGISTRATION_EVENT.UA_REGISTER_TIMEOUT },
        () => {},
      );
    } else {
      this._eventQueue.push(
        { name: REGISTRATION_EVENT.UA_REGISTER_FAILED },
        () => {},
      );
    }
  }

  private _onUAReceiveInvite(session: any) {
    this.emit(REGISTRATION_EVENT.RECEIVER_INCOMING_SESSION, session);
  }
}

export { RTCRegistrationManager };
