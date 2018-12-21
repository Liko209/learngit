import { EventEmitter2 } from 'eventemitter2';

class SipCallSession extends EventEmitter2 {
  private _session: any = null;
  constructor() {
    super();
  }
  private _prepareSipSession() {}

  private _onSessionConfirmed() {}

  private _onSessionDisconnected() {}

  private _onSessionError() {}

  hangup() {}
}
