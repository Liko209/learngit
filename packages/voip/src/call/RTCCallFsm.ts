import { RTCCallFsmTable, IRTCCallFsmTableDependency } from './RTCCallFsmTable';
import { EventEmitter2 } from 'eventemitter2';
import queue from 'async/queue';

const CallFsmEvent = {
  HANGUP: 'hangupEvent',
  ACCOUNT_READY: 'accountReadyEvent',
  ACCOUNT_NOT_READY: 'accountNotReadyEvent',
  SESSION_CONFIRMED: 'sessionConfirmedEvent',
  SESSION_DISCONNECTED: 'sessionDisconnectedEvent',
  SESSION_ERROR: 'sessionErrorEvent',
};

enum RTCCallFsmNotify {
  ENTERPENDING = 'enterPending',
  ENTERCONNECTING = 'enterConnecting',
  ENTERCONNECTED = 'enterConnected',
  ENTERDISCONNECTED = 'enterDisconnected',
  HANGUPACTION = 'hangupAction',
  CREATEOUTCALLSESSION = 'createOutCallSession',
}

class RTCCallFsm extends EventEmitter2 implements IRTCCallFsmTableDependency {
  private _callFsmTable: RTCCallFsmTable;
  private _eventQueue: any;

  constructor() {
    super();
    this._callFsmTable = new RTCCallFsmTable(this);
    // this._callFsmTable = new RTCCallFsmTable(this);
    this._eventQueue = new queue((task: any, callback: any) => {
      switch (task.name) {
        case CallFsmEvent.HANGUP: {
          this._onHangup();
          break;
        }
        case CallFsmEvent.ACCOUNT_READY: {
          this._onAccountReady();
          break;
        }
        case CallFsmEvent.ACCOUNT_NOT_READY: {
          this._onAccountNotReady();
          break;
        }
        case CallFsmEvent.SESSION_CONFIRMED: {
          this._onSessionConfirmed();
          break;
        }
        case CallFsmEvent.SESSION_DISCONNECTED: {
          this._onSessionDisconnected();
          break;
        }
        case CallFsmEvent.SESSION_ERROR: {
          this._onSessionError();
          break;
        }
        default: {
          break;
        }
      }
      callback();
    });
    // Observer FSM State
    // enter pending state will also report connecting for now
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
    this._eventQueue.push({ name: CallFsmEvent.HANGUP }, () => {});
  }

  public accountReady() {
    this._eventQueue.push({ name: CallFsmEvent.ACCOUNT_READY }, () => {});
  }

  public accountNotReady() {
    this._eventQueue.push({ name: CallFsmEvent.ACCOUNT_NOT_READY }, () => {});
  }

  public sessionConfirmed() {
    this._eventQueue.push({ name: CallFsmEvent.SESSION_CONFIRMED }, () => {});
  }

  public sessionDisconnected() {
    this._eventQueue.push(
      { name: CallFsmEvent.SESSION_DISCONNECTED },
      () => {},
    );
  }

  public sessionError() {
    this._eventQueue.push({ name: CallFsmEvent.SESSION_ERROR }, () => {});
  }

  onHangupAction() {
    this.emit(RTCCallFsmNotify.HANGUPACTION);
  }

  onCreateOutCallSession() {
    this.emit(RTCCallFsmNotify.CREATEOUTCALLSESSION);
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
    this.emit(RTCCallFsmNotify.ENTERPENDING);
  }

  private _onEnterConnecting() {
    this.emit(RTCCallFsmNotify.ENTERCONNECTING);
  }

  private _onEnterConnected() {
    this.emit(RTCCallFsmNotify.ENTERCONNECTED);
  }

  private _onEnterDisconnected() {
    this.emit(RTCCallFsmNotify.ENTERDISCONNECTED);
  }

  // Only for unit test
  private _fsmGoto(state: string) {
    this._callFsmTable.goto(state);
  }
}

export { RTCCallFsm, RTCCallFsmNotify };
