import { EventEmitter2 } from 'eventemitter2';
import { IRTCCallSession, CALL_SESSION_STATE } from './IRTCCallSession';
import { RTCCALL_ACTION } from './types';

enum WEBPHONE_STATE {
  ACCEPTED = 'accepted',
  BYE = 'bye',
  FAILED = 'failed',
}

class RTCSipCallSession extends EventEmitter2 implements IRTCCallSession {
  private _session: any = null;
  private _isRecord: boolean = false;
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
      this._session.hangup();
    }
  }

  flip(target: number) {
    this._session.flip(target).then(
      () => {
        this.emit(RTCCALL_ACTION.FLIP_SUCCESS);
      },
      () => {
        this.emit(RTCCALL_ACTION.FLIP_FAILED);
      },
    );
  }

  startRecord() {
    if (!this._isRecord) {
      this._isRecord = true;
      this._session.startRecord().then(
        () => {
          this.emit(RTCCALL_ACTION.START_RECORD_SUCCESS);
        },
        () => {
          this._isRecord = false;
          this.emit(RTCCALL_ACTION.START_RECORD_FAILED);
        },
      );
    } else {
      this.emit(RTCCALL_ACTION.START_RECORD_SUCCESS);
    }
  }

  stopRecord() {
    if (!this._isRecord) {
      this.emit(RTCCALL_ACTION.STOP_RECORD_SUCCESS);
    } else {
      this._isRecord = false;
      this._session.stopRecord().then(
        () => {
          this.emit(RTCCALL_ACTION.STOP_RECORD_SUCCESS);
        },
        () => {
          this._isRecord = true;
          this.emit(RTCCALL_ACTION.STOP_RECORD_FAILED);
        },
      );
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
