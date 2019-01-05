/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:51:30
 * Copyright © RingCentral. All rights reserved.
 */

import { EventEmitter2 } from 'eventemitter2';
import { IRTCCallSession } from '../signaling/IRTCCallSession';
import { CALL_SESSION_STATE } from '../call/types';

enum WEBPHONE_STATE {
  ACCEPTED = 'accepted',
  BYE = 'bye',
  FAILED = 'failed',
}

class RTCSipCallSession extends EventEmitter2 implements IRTCCallSession {
  private _session: any = null;
  constructor() {
    super();
  }
  private _prepareSipSession() {
    if (this._session == null) {
      return;
    }

    this._session.on(WEBPHONE_STATE.ACCEPTED, () => {
      this._onSessionConfirmed();
    });
    this._session.on(WEBPHONE_STATE.BYE, () => {
      this._onSessionDisconnected();
    });
    this._session.on(WEBPHONE_STATE.FAILED, () => {
      this._onSessionError();
    });
  }

  private _onSessionConfirmed() {
    this.emit(CALL_SESSION_STATE.CONFIRMED);
  }

  private _onSessionDisconnected() {
    this.emit(CALL_SESSION_STATE.DISCONNECTED);
  }

  private _onSessionError() {
    this.emit(CALL_SESSION_STATE.ERROR);
  }

  hangup() {
    if (this._session != null) {
      this._session.terminate();
    }
  }

  answer() {
    if (this._session != null) {
      this._session.accept();
    }
  }

  reject() {
    if (this._session != null) {
      this._session.reject();
    }
  }

  sendToVoicemail() {
    if (this._session != null) {
      this._session.toVoicemail();
    }
  }

  setSession(session: any) {
    if (session != null) {
      this._session = session;
      this._prepareSipSession();
    }
  }

  getSession() {
    return this._session;
  }
}

export { RTCSipCallSession, WEBPHONE_STATE };
