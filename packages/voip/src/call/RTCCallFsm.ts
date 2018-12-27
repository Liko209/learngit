import { RTCCallFsmTable, IRTCCallFsmTableDependency } from './RTCCallFsmTable';
import { EventEmitter2 } from 'eventemitter2';
import queue from 'async/queue';

const CallFsmEvent = {
  HANGUP: 'hangupEvent',
  ANSWER: 'answerEvent',
  REJECT: 'rejectEvent',
  SEND_TO_VOICEMAIL: 'sendToVoicemailEvent',
  ACCOUNT_READY: 'accountReadyEvent',
  ACCOUNT_NOT_READY: 'accountNotReadyEvent',
  SESSION_CONFIRMED: 'sessionConfirmedEvent',
  SESSION_DISCONNECTED: 'sessionDisconnectedEvent',
  SESSION_ERROR: 'sessionErrorEvent',
};

class RTCCallFsm extends EventEmitter2 implements IRTCCallFsmTableDependency {
  private _callFsmTable: RTCCallFsmTable = new RTCCallFsmTable(this);
  private _eventQueue: any;

  constructor() {
    super();
    // this._callFsmTable = new RTCCallFsmTable(this);
    this._eventQueue = new queue((task: any, callback: any) => {
      switch (task.name) {
        case CallFsmEvent.HANGUP: {
          this._onHangup();
          break;
        }
        case CallFsmEvent.ANSWER: {
          this._onAnswer();
          break;
        }
        case CallFsmEvent.REJECT: {
          this._onReject();
          break;
        }
        case CallFsmEvent.SEND_TO_VOICEMAIL: {
          this._onSendToVoicemail();
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
    this._callFsmTable.observe('onAnswering', () => this._onEnterAnswering());
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

  public answer() {
    this._eventQueue.push({ name: CallFsmEvent.ANSWER }, () => {});
  }

  public reject() {
    this._eventQueue.push({ name: CallFsmEvent.REJECT }, () => {});
  }

  public sendToVoicemail() {
    this._eventQueue.push({ name: CallFsmEvent.SEND_TO_VOICEMAIL }, () => {});
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
    this.emit('hangupAction');
  }

  onCreateOutCallSession() {
    this.emit('createOutCallSession');
  }

  private _onHangup() {
    this._callFsmTable.hangup();
  }

  private _onAnswer() {
    this._callFsmTable.answer();
  }

  private _onReject() {
    this._callFsmTable.reject();
  }

  private _onSendToVoicemail() {
    this._callFsmTable.sendToVoicemail();
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

  private _onEnterAnswering() {
    this.emit('enterAnswering');
  }

  private _onEnterPending() {
    this.emit('enterPending');
  }

  private _onEnterConnecting() {
    this.emit('enterConnecting');
  }

  private _onEnterConnected() {
    this.emit('enterConnected');
  }

  private _onEnterDisconnected() {
    this.emit('enterDisconnected');
  }

  // Only for unit test
  private _fsmGoto(state: string) {
    this._callFsmTable.goto(state);
  }
}

export { RTCCallFsm };
