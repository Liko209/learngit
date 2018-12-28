/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-27 11:15:01
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCRegistrationFSM } from './RTCRegistrationFSM';
import { IConditionalHandler } from './IConditionalHandler';
import { EventEmitter2 } from 'eventemitter2';
import { IRTCUserAgent, UA_EVENT } from '../signaling/IRTCUserAgent';
import { RTCSipUserAgent } from '../signaling/RTCSipUserAgent';
import { IRTCAccountListener } from '../api/IRTCAccountListener';
import { AccountState } from '../api/types';

import { ErrorCode, RegistrationState } from './types';

const RegistrationEvent = {
  PROVISION_READY: 'provisionReady',
};

const ObserveEvent = {
  REG_IN_PROGRESS: 'onRegInProgress',
  READY: 'onReady',
  REG_FAILURE: 'onRegFailure',
  UN_REGISTERED: 'onUnRegistered',
};

class RTCRegistrationManager implements IConditionalHandler {
  private _fsm: RTCRegistrationFSM;
  private _eventEmitter: EventEmitter2;
  private _userAgent: IRTCUserAgent;
  private _listener: IRTCAccountListener;

  public onReadyWhenRegSucceed(): string {
    return RegistrationState.READY;
  }

  constructor(listener: IRTCAccountListener) {
    this._listener = listener;
    this._fsm = new RTCRegistrationFSM(this);
    this._eventEmitter = new EventEmitter2();
    this._initFsmObserve();
    this._initListener();
  }

  private _onEnterReady() {
    this._listener.onAccountStateChanged(
      AccountState.IN_PROGRESS,
      AccountState.REGISTERED,
    );
  }
  private _onEnterRegInProgress() {
    this._listener.onAccountStateChanged(
      AccountState.IDLE,
      AccountState.IN_PROGRESS,
    );
  }
  private _onEnterRegFailure() {
    this._listener.onAccountStateChanged(
      AccountState.IN_PROGRESS,
      AccountState.FAILED,
    );
  }
  private _onEnterUnRegistered() {
    this._listener.onAccountStateChanged(
      AccountState.REGISTERED,
      AccountState.UNREGISTERED,
    );
  }

  private _initFsmObserve() {
    this._fsm.observe(ObserveEvent.REG_IN_PROGRESS, () => {
      this._onEnterRegInProgress();
    });
    this._fsm.observe(ObserveEvent.READY, () => {
      this._onEnterReady();
    });
    this._fsm.observe(ObserveEvent.REG_FAILURE, () => {
      this._onEnterRegFailure();
    });
    this._fsm.observe(ObserveEvent.UN_REGISTERED, () => {
      this._onEnterUnRegistered();
    });
  }

  private _initListener() {
    this._eventEmitter.on(UA_EVENT.REG_SUCCESS, () => {
      this._onUARegSuccess();
    });
    this._eventEmitter.on(UA_EVENT.REG_FAILED, (response: any, cause: any) => {
      this._onUARegFailed(response, cause);
    });
    this._eventEmitter.on(
      RegistrationEvent.PROVISION_READY,
      (provisionData: any, options: any) => {
        this._doRegister(provisionData, options);
      },
    );
  }

  public provisionReady(provisionData: any, options: any) {
    this._eventEmitter.emit(
      RegistrationEvent.PROVISION_READY,
      provisionData,
      options,
    );
  }

  private _doRegister(provisionData: any, options: any) {
    this._fsm.provisionReady();
    this._userAgent = new RTCSipUserAgent(
      provisionData,
      options,
      this._eventEmitter,
    );
  }

  public makeCall(phoneNumber: string, options: any): any {
    return this._userAgent.makeCall(phoneNumber, options);
  }

  private _onUARegSuccess() {
    this._fsm.regSucceed();
  }

  private _onUARegFailed(response: any, cause: any) {
    if (ErrorCode.TIME_OUT === cause) {
      this._fsm.regTimeOut();
    } else {
      this._fsm.regError();
    }
  }
}

export { RTCRegistrationManager };
