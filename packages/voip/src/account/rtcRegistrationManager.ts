/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2018-12-10 10:30:19
 * Copyright © RingCentral. All rights reserved.
 */

import {
  RTCRegistrationFSM,
  IConditionalHandler,
  RegistrationState,
} from './rtcRegistrationFSM';
import { IRTCAccountListener, AccountState } from '../api/rtcAccount';

class RTCRegistrationManager implements IConditionalHandler {
  private _fsm: RTCRegistrationFSM;
  private _originalState: AccountState;
  private _listener: IRTCAccountListener;

  onReadyWhenRegSucceed(): string {
    return RegistrationState.READY;
  }

  onReadyWhenNetworkChanged(): string {
    console.log('onReadyWhenNetworkChanged');
    return RegistrationState.READY;
  }

  onReady() {
    if (this._listener) {
      this._listener.onAccountStateChanged(
        AccountState.REGISTERED,
        this._originalState,
      );
    }
  }

  onLeaveReady() {
    this._originalState = AccountState.REGISTERED;
  }

  onLeaveRegInProgress() {
    this._originalState = AccountState.IN_PROGRESS;
  }

  onRegInProgress() {
    if (this._listener) {
      this._listener.onAccountStateChanged(
        AccountState.IN_PROGRESS,
        this._originalState,
      );
    }
  }

  onUnRegInProgress() {
    if (this._listener) {
      this._listener.onAccountStateChanged(
        AccountState.IN_PROGRESS,
        this._originalState,
      );
    }
  }

  onLeaveUnRegInProgress() {
    this._originalState = AccountState.IN_PROGRESS;
  }

  onIdle() {
    if (this._listener) {
      this._listener.onAccountStateChanged(
        AccountState.IDLE,
        this._originalState,
      );
    }
  }

  onLeaveIdle() {
    this._originalState = AccountState.IDLE;
  }

  onRegFailure() {
    if (this._listener) {
      this._listener.onAccountStateChanged(
        AccountState.FAILED,
        this._originalState,
      );
    }
  }

  onLeaveRegFailure() {
    this._originalState = AccountState.FAILED;
  }

  onNone() {
    if (this._listener) {
      this._listener.onAccountStateChanged(
        AccountState.IDLE,
        this._originalState,
      );
    }
  }

  constructor(listener: IRTCAccountListener) {
    this._listener = listener;
    this._fsm = new RTCRegistrationFSM(this);
    this._fsm.observe('onReady', () => this.onReady());
    this._fsm.observe('onLeaveReady', () => this.onLeaveReady());

    this._fsm.observe('onRegInProgress', () => this.onRegInProgress());
    this._fsm.observe('onLeaveRegInProgress', () =>
      this.onLeaveRegInProgress(),
    );

    this._fsm.observe('onNone', () => this.onNone());

    this._fsm.observe('onUnRegInProgress', () => this.onUnRegInProgress());
    this._fsm.observe('onLeaveUnRegInProgress', () =>
      this.onLeaveUnRegInProgress(),
    );

    this._fsm.observe('onRegFailure', () => this.onRegFailure());
    this._fsm.observe('onLeaveRegFailure', () => this.onLeaveRegFailure());

    this._fsm.observe('onIdle', () => this.onIdle());
    this._fsm.observe('onLeaveIdle', () => this.onLeaveIdle());
  }

  public deRegister() {
    this._fsm.deRegister();
  }

  public doRegister() {
    this._fsm.doRegister();
  }

  public regSucceed() {
    this._fsm.regSucceed();
  }

  public networkChanged() {
    this._fsm.networkChanged();
  }

  public deRegSucceed() {
    this._fsm.deRegSucceed();
  }
}

export { RTCRegistrationManager };
