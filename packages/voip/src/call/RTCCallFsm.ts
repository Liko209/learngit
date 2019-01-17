/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2018-12-29 16:08:34
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCCallFsmTable, IRTCCallFsmTableDependency } from './RTCCallFsmTable';
import { EventEmitter2 } from 'eventemitter2';
import async from 'async';
import { CALL_FSM_NOTIFY } from './types';

const CallFsmEvent = {
  HANGUP: 'hangupEvent',
  FLIP: 'flipEvent',
  START_RECORD: 'startRecordEvent',
  STOP_RECORD: 'stopRecordEvent',
  TRANSFER: 'transferEvent',
  ANSWER: 'answerEvent',
  REJECT: 'rejectEvent',
  SEND_TO_VOICEMAIL: 'sendToVoicemailEvent',
  ACCOUNT_READY: 'accountReadyEvent',
  ACCOUNT_NOT_READY: 'accountNotReadyEvent',
  SESSION_CONFIRMED: 'sessionConfirmedEvent',
  SESSION_DISCONNECTED: 'sessionDisconnectedEvent',
  SESSION_ERROR: 'sessionErrorEvent',
  PARK: 'park',
};

class RTCCallFsm extends EventEmitter2 implements IRTCCallFsmTableDependency {
  private _callFsmTable: RTCCallFsmTable;
  private _eventQueue: any;

  constructor() {
    super();
    this._callFsmTable = new RTCCallFsmTable(this);
    this._eventQueue = async.queue((task: any, callback: any) => {
      switch (task.name) {
        case CallFsmEvent.HANGUP: {
          this._onHangup();
          break;
        }
        case CallFsmEvent.FLIP: {
          this._onFlip(task.params);
          break;
        }
        case CallFsmEvent.START_RECORD: {
          this._onStartRecord();
          break;
        }
        case CallFsmEvent.STOP_RECORD: {
          this._onStopRecord();
          break;
        }
        case CallFsmEvent.TRANSFER: {
          this._onTransfer(task.params);
          break;
        }
        case CallFsmEvent.PARK: {
          this._onPark();
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
    this._callFsmTable.observe(CALL_FSM_NOTIFY.ON_ANSWERING, () =>
      this._onEnterAnswering(),
    );
    this._callFsmTable.observe(CALL_FSM_NOTIFY.ON_PENDING, () =>
      this._onEnterPending(),
    );
    this._callFsmTable.observe(CALL_FSM_NOTIFY.ON_CONNECTING, () =>
      this._onEnterConnecting(),
    );
    this._callFsmTable.observe(CALL_FSM_NOTIFY.ON_CONNECTED, () =>
      this._onEnterConnected(),
    );
    this._callFsmTable.observe(CALL_FSM_NOTIFY.ON_DISCONNECTED, () =>
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

  flip(target: number) {
    this._eventQueue.push(
      { name: CallFsmEvent.FLIP, params: target },
      () => {},
    );
  }

  startRecord(): void {
    this._eventQueue.push({ name: CallFsmEvent.START_RECORD }, () => {});
  }

  stopRecord(): void {
    this._eventQueue.push({ name: CallFsmEvent.STOP_RECORD }, () => {});
  }

  park() {
    this._eventQueue.push({ name: CallFsmEvent.PARK }, () => {});
  }

  transfer(target: string): void {
    this._eventQueue.push(
      { name: CallFsmEvent.TRANSFER, params: target },
      () => {},
    );
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

  onAnswerAction() {
    this.emit(CALL_FSM_NOTIFY.ANSWER_ACTION);
  }

  onRejectAction() {
    this.emit(CALL_FSM_NOTIFY.REJECT_ACTION);
  }

  onSendToVoicemailAction() {
    this.emit(CALL_FSM_NOTIFY.SEND_TO_VOICEMAIL_ACTION);
  }

  onHangupAction() {
    this.emit(CALL_FSM_NOTIFY.HANGUP_ACTION);
  }

  onCreateOutCallSession() {
    this.emit(CALL_FSM_NOTIFY.CREATE_OUTGOING_CALL_SESSION);
  }

  onFlipAction(target: number) {
    this.emit(CALL_FSM_NOTIFY.FLIP_ACTION, target);
  }

  onTransferAction(target: string) {
    this.emit(CALL_FSM_NOTIFY.TRANSFER_ACTION, target);
  }

  onParkAction() {
    this.emit(CALL_FSM_NOTIFY.PARK_ACTION);
  }

  onStartRecordAction() {
    this.emit(CALL_FSM_NOTIFY.START_RECORD_ACTION);
  }

  onStopRecordAction() {
    this.emit(CALL_FSM_NOTIFY.STOP_RECORD_ACTION);
  }

  onReportCallActionFailed(name: string): void {
    this.emit(CALL_FSM_NOTIFY.CALL_ACTION_FAILED, name);
  }

  private _onHangup() {
    this._callFsmTable.hangup();
  }

  private _onFlip(target: number) {
    this._callFsmTable.flip(target);
  }

  private _onTransfer(target: string) {
    this._callFsmTable.transfer(target);
  }

  private _onPark() {
    this._callFsmTable.park();
  }

  private _onStartRecord() {
    this._callFsmTable.startRecord();
  }

  private _onStopRecord() {
    this._callFsmTable.stopRecord();
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
    this.emit(CALL_FSM_NOTIFY.ENTER_ANSWERING);
  }

  private _onEnterPending() {
    this.emit(CALL_FSM_NOTIFY.ENTER_PENDING);
  }

  private _onEnterConnecting() {
    this.emit(CALL_FSM_NOTIFY.ENTER_CONNECTING);
  }

  private _onEnterConnected() {
    this.emit(CALL_FSM_NOTIFY.ENTER_CONNECTED);
  }

  private _onEnterDisconnected() {
    this.emit(CALL_FSM_NOTIFY.ENTER_DISCONNECTED);
  }
}

export { RTCCallFsm };
