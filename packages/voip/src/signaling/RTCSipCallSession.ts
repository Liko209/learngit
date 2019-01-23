/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:51:30
 * Copyright © RingCentral. All rights reserved.
 */

import { EventEmitter2 } from 'eventemitter2';
import { IRTCCallSession } from '../signaling/IRTCCallSession';
import { CALL_SESSION_STATE, CALL_FSM_NOTIFY } from '../call/types';
import { RTC_CALL_ACTION, RTCCallActionSuccessOptions } from '../api/types';
import { WEBPHONE_SESSION_STATE } from '../signaling/types';

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
    this._session.on(WEBPHONE_SESSION_STATE.ACCEPTED, () => {
      this._onSessionConfirmed();
    });
    this._session.on(WEBPHONE_SESSION_STATE.BYE, () => {
      this._onSessionDisconnected();
    });
    this._session.on(WEBPHONE_SESSION_STATE.FAILED, () => {
      this._onSessionError();
    });
    this._session.on(WEBPHONE_SESSION_STATE.PROGRESS, () => {
      this._onSessionProgress();
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

  private _onSessionProgress() {
    this.emit(CALL_SESSION_STATE.PROGRESS);
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
    if (this._session) {
      this._session.mute();
    }
  }

  unmute() {
    if (this._session) {
      this._session.unmute();
    }
  }

  answer() {
    if (this._session) {
      this._session.accept();
    }
  }

  reject() {
    if (this._session) {
      this._session.reject();
    }
  }

  sendToVoicemail() {
    if (this._session) {
      this._session.toVoicemail();
    }
  }

  hold() {
    if (this._session) {
      this._session.hold().then(
        () => {
          this.emit(CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS, RTC_CALL_ACTION.HOLD);
        },
        () => {
          this.emit(CALL_FSM_NOTIFY.CALL_ACTION_FAILED, RTC_CALL_ACTION.HOLD);
        },
      );
    }
  }

  unhold() {
    if (this._session) {
      this._session.unhold().then(
        () => {
          this.emit(
            CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
            RTC_CALL_ACTION.UNHOLD,
          );
        },
        () => {
          this.emit(CALL_FSM_NOTIFY.CALL_ACTION_FAILED, RTC_CALL_ACTION.UNHOLD);
        },
      );
    }
  }

  dtmf(digits: string) {
    if (this._session) {
      this._session.dtmf(digits);
    }
  }

  setSession(session: any) {
    if (session) {
      this._session = session;
      this._prepareSipSession();
    }
  }

  getSession() {
    return this._session;
  }
}

export { RTCSipCallSession };
