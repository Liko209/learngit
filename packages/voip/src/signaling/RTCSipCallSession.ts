/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:51:30
 * Copyright © RingCentral. All rights reserved.
 */

import { EventEmitter2 } from 'eventemitter2';
import { IRTCCallSession } from '../signaling/IRTCCallSession';
import { CALL_SESSION_STATE, CALL_FSM_NOTIFY } from '../call/types';
import { RTC_CALL_ACTION, RTCCallActionSuccessOptions } from '../api/types';

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
  destroy() {
    if (!this._session) {
      return;
    }
    this._session.removeAllListeners();
    this._session = null;
  }

  private _prepareSipSession() {
    if (!this._session) {
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

  flip(target: number) {
    this._session.flip(target).then(
      () => {
        this.emit(CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS, RTC_CALL_ACTION.FLIP);
      },
      () => {
        this.emit(CALL_FSM_NOTIFY.CALL_ACTION_FAILED, RTC_CALL_ACTION.FLIP);
      },
    );
  }

  transfer(target: string) {
    this._session.transfer(target).then(
      () => {
        this.emit(
          CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
          RTC_CALL_ACTION.TRANSFER,
        );
      },
      () => {
        this.emit(CALL_FSM_NOTIFY.CALL_ACTION_FAILED, RTC_CALL_ACTION.TRANSFER);
      },
    );
  }

  park() {
    this._session.park().then(
      (parkOptions: any) => {
        const options: RTCCallActionSuccessOptions = {
          parkExtension: parkOptions['park extension'],
        };
        this.emit(
          CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
          RTC_CALL_ACTION.PARK,
          options,
        );
      },
      () => {
        this.emit(CALL_FSM_NOTIFY.CALL_ACTION_FAILED, RTC_CALL_ACTION.PARK);
      },
    );
  }

  startRecord() {
    this._session.startRecord().then(
      () => {
        this.emit(
          CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
          RTC_CALL_ACTION.START_RECORD,
        );
      },
      () => {
        this.emit(
          CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
          RTC_CALL_ACTION.START_RECORD,
        );
      },
    );
  }

  stopRecord() {
    this._session.stopRecord().then(
      () => {
        this.emit(
          CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
          RTC_CALL_ACTION.STOP_RECORD,
        );
      },
      () => {
        this.emit(
          CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
          RTC_CALL_ACTION.STOP_RECORD,
        );
      },
    );
  }

  mute() {
    this._session.mute();
    this.emit(CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS, RTC_CALL_ACTION.MUTE);
  }

  unmute() {
    this._session.unmute();
    this.emit(CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS, RTC_CALL_ACTION.UNMUTE);
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
