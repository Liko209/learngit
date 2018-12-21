import { EventEmitter2 } from 'eventemitter2';

class SipCallSession extends EventEmitter2 {
  private _session: any = null;
  constructor() {
    super();
  }
  private _prepareSipSession() {
    if (this._session == null) {
      return;
    }
    this._session.on('accepted', this._onSessionConfirmed.bind(this));
    this._session.on('accepted', this._onSessionDisconnected.bind(this));
    this._session.on('failed', this._onSessionError.bind(this));
  }

  private _onSessionConfirmed() {}

  private _onSessionDisconnected() {}

  private _onSessionError() {}

  hangup() {}

  setSession(session: any) {
    if (session != null) {
      this._session = session;
      this._prepareSipSession();
    }
  }
}
