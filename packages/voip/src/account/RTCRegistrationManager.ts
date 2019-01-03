/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-27 11:15:01
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCRegistrationFSM } from './RTCRegistrationFSM';
import { IConditionalHandler } from './IConditionalHandler';
import { EventEmitter2 } from 'eventemitter2';
import { IRTCUserAgent } from '../signaling/IRTCUserAgent';
import { RTCSipUserAgent } from '../signaling/RTCSipUserAgent';
import { IRTCAccountDelegate } from '../api/IRTCAccountDelegate';
import { RTC_ACCOUNT_STATE } from '../api/types';
import { UA_EVENT } from '../signaling/types';

import { ErrorCode, RegistrationManagerEvent } from './types';

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
  public _eventEmitter: EventEmitter2;
  private _userAgent: IRTCUserAgent;
  private _listener: IRTCAccountDelegate;
  private _isReady: boolean;

  public onReadyWhenRegSucceedAction(): void {}
  public onProvisionReadyAction(provisionData: any, options: any): void {
    this._userAgent = new RTCSipUserAgent(
      provisionData,
      options,
      this._eventEmitter,
    );
  }

  constructor(listener: IRTCAccountDelegate) {
    this._listener = listener;
    this._fsm = new RTCRegistrationFSM(this);
    this._eventEmitter = new EventEmitter2();
    this._initFsmObserve();
    this._initListener();
    this._isReady = false;
  }

  private _onEnterReady() {
    this._isReady = true;
    this._listener.onAccountStateChanged(RTC_ACCOUNT_STATE.REGISTERED);
  }
  private _onEnterRegInProgress() {
    this._isReady = false;
    this._listener.onAccountStateChanged(RTC_ACCOUNT_STATE.IN_PROGRESS);
  }
  private _onEnterRegFailure() {
    this._isReady = false;
    this._listener.onAccountStateChanged(RTC_ACCOUNT_STATE.FAILED);
  }
  private _onEnterUnRegistered() {
    this._isReady = false;
    this._listener.onAccountStateChanged(RTC_ACCOUNT_STATE.UNREGISTERED);
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
    this._eventEmitter.on(UA_EVENT.RECEIVE_INVITE, (session: any) => {
      this._onReceiveInvite(session);
    });
    this._eventEmitter.on(UA_EVENT.REG_UNREGISTER, () => {
      this._onUADeRegister();
    });
    this._eventEmitter.on(
      RegistrationEvent.PROVISION_READY,
      (provisionData: any, options: any) => {
        this._onProvisionReady(provisionData, options);
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

  private _onProvisionReady(provisionData: any, options: any) {
    this._fsm.provisionReady(provisionData, options);
  }

  public createOutgoingCallSession(phoneNumber: string, options: any): any {
    return this._userAgent.makeCall(phoneNumber, options);
  }

  public isReady(): boolean {
    return this._isReady;
  }

  private _onUARegSuccess() {
    this._fsm.regSucceed();
  }

  private _onUADeRegister() {
    this._fsm.unRegister();
  }

  private _onUARegFailed(response: any, cause: any) {
    if (ErrorCode.TIME_OUT === cause) {
      this._fsm.regTimeOut();
    } else {
      this._fsm.regError();
    }
  }

  private _onReceiveInvite(session: any) {
    this._eventEmitter.emit(
      RegistrationManagerEvent.RECEIVER_INCOMING_SESSION,
      session,
    );
  }
}

export { RTCRegistrationManager };
