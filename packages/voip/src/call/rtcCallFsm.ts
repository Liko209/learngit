import { RtcCallFsmTable } from './rtcCallFsmTable';
import { EventEmitter2 } from 'eventemitter2';

const CallFsmEvent = {
  HANGUP: 'hangupEvent',
  ACCOUNT_READY: 'accountReadyEvent',
  ACCOUNT_NOT_READY: 'accountNotReadyEvent',
  SESSION_CONFIRMED: 'sessionConfirmedEvent',
  SESSION_DISCONNECTED: 'sessionDisconnectedEvent',
  SESSION_ERROR: 'sessionErrorEvent',
};

class RtcCallFsm extends EventEmitter2 {
  private _emitter: EventEmitter2;
  private _callFsmTable: RtcCallFsmTable;

  constructor() {
    super();
    this._emitter = new EventEmitter2();
    this._callFsmTable = new RtcCallFsmTable();
    // Send Events in FSM
    this._emitter.on(CallFsmEvent.HANGUP, () => {
      this._onHangup();
    });
    this._emitter.on(CallFsmEvent.ACCOUNT_READY, () => {
      this._onAccountReady();
    });
    this._emitter.on(CallFsmEvent.ACCOUNT_NOT_READY, () => {
      this._onAccountNotReady();
    });
    this._emitter.on(CallFsmEvent.SESSION_CONFIRMED, () => {
      this._onSessionConfirmed();
    });
    this._emitter.on(CallFsmEvent.SESSION_DISCONNECTED, () => {
      this._onSessionDisconnected();
    });
    this._emitter.on(CallFsmEvent.SESSION_ERROR, () => {
      this._onSessionError();
    });
    // Observer FSM State
    this._callFsmTable.observe('onPending', () => this._onEnterPending());
    this._callFsmTable.observe('onConnecting', () => this._onEnterConnecting());
    this._callFsmTable.observe('onConnected', () => this._onEnterConnected());
    this._callFsmTable.observe('onDisconnected', () =>
      this._onEnterDisconnected(),
    );
  }

  public state(): string {
    return this._callFsmTable.state;
  }

  public hangup() {
    this._emitter.emit(CallFsmEvent.HANGUP);
  }

  public accountReady() {
    this._emitter.emit(CallFsmEvent.ACCOUNT_READY);
  }

  public accountNotReady() {
    this._emitter.emit(CallFsmEvent.ACCOUNT_NOT_READY);
  }

  public sessionConfirmed() {
    this._emitter.emit(CallFsmEvent.SESSION_CONFIRMED);
  }

  public sessionDisconnected() {
    this._emitter.emit(CallFsmEvent.SESSION_DISCONNECTED);
  }

  public sessionError() {
    this._emitter.emit(CallFsmEvent.SESSION_ERROR);
  }

  private _onHangup() {
    this._callFsmTable.hangup();
  }

  private _onAccountReady() {
    this._callFsmTable.accountReady();
  }

  private _onAccountNotReady() {
    this._callFsmTable.accountNotReady();
  }

  private _onSessionConfirmed() {
    this._callFsmTable.sessionConfirmed();
  }

  private _onSessionDisconnected() {
    this._callFsmTable.sessionDisconnected();
  }

  private _onSessionError() {
    this._callFsmTable.sessionError();
  }

  private _onEnterPending() {
    super.emit('enterPending');
  }

  private _onEnterConnecting() {
    super.emit('enterConnecting');
  }

  private _onEnterConnected() {
    super.emit('enterConnected');
  }

  private _onEnterDisconnected() {
    super.emit('enterDisconnected');
  }

  // Only for unit test
  private _fsmGoto(state: string) {
    this._callFsmTable.goto(state);
  }
}

export { RtcCallFsm };
