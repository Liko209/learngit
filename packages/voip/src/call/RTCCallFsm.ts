/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2018-12-29 16:08:34
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import async from 'async';
import { RTCCallFsmTable, IRTCCallFsmTableDependency } from './RTCCallFsmTable';
import { CALL_FSM_NOTIFY } from './types';
import {
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
  RTC_CALL_ACTION_ERROR_CODE,
  RTC_CALL_ACTION_DIRECTION,
} from '../api/types';
import { FsmStatusCategory } from '../report/types';
import { CallReport } from '../report/Call';

const CallFsmEvent = {
  HANGUP: 'hangupEvent',
  FLIP: 'flipEvent',
  START_RECORD: 'startRecordEvent',
  STOP_RECORD: 'stopRecordEvent',
  MUTE: 'muteEvent',
  UNMUTE: 'unmuteEvent',
  TRANSFER: 'transferEvent',
  WARM_TRANSFER: 'warmTransferEvent',
  FORWARD: 'forwardEvent',
  ANSWER: 'answerEvent',
  REJECT: 'rejectEvent',
  IGNORE: 'ignoreEvent',
  SEND_TO_VOICEMAIL: 'sendToVoicemailEvent',
  HOLD: 'holdEvent',
  UNHOLD: 'unholdEvent',
  PARK: 'parkEvent',
  DTMF: 'dtmfEvent',
  START_REPLY: 'startReplyEvent',
  REPLY_WITH_MSG: 'replyWithMsgEvent',
  REPLY_WITH_PATTERN: 'replyWithPatternEvent',
  ACCOUNT_READY: 'accountReadyEvent',
  ACCOUNT_NOT_READY: 'accountNotReadyEvent',
  SESSION_ACCEPTED: 'sessionAcceptedEvent',
  SESSION_CONFIRMED: 'sessionConfirmedEvent',
  SESSION_DISCONNECTED: 'sessionDisconnectedEvent',
  SESSION_ERROR: 'sessionErrorEvent',
  HOLD_SUCCESS: 'holdSuccessEvent',
  HOLD_FAILED: 'holdFailedEvent',
  UNHOLD_SUCCESS: 'unholdSuccessEvent',
  UNHOLD_FAILED: 'unholdFailedEvent',
};

class RTCCallFsm extends EventEmitter2 implements IRTCCallFsmTableDependency {
  private _callFsmTable: RTCCallFsmTable;
  private _eventQueue: any;
  private _report: CallReport;

  constructor(report: CallReport) {
    super();
    this._report = report;
    this._callFsmTable = new RTCCallFsmTable(this);
    this._eventQueue = async.queue((task: any, callback: any) => {
      callback(task.params);
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
    this._callFsmTable.observe(CALL_FSM_NOTIFY.ON_LEAVE_CONNECTED, () =>
      this._onLeaveConnected(),
    );
  }

  state(): string {
    return this._callFsmTable.state;
  }

  answer() {
    this._eventQueue.push({ name: CallFsmEvent.ANSWER }, () => {
      this._onAnswer();
    });
  }

  reject() {
    this._eventQueue.push({ name: CallFsmEvent.REJECT }, () => {
      this._onReject();
    });
  }

  ignore() {
    this._eventQueue.push({ name: CallFsmEvent.IGNORE }, () => {
      this._callFsmTable.ignore();
    });
  }

  sendToVoicemail() {
    this._eventQueue.push({ name: CallFsmEvent.SEND_TO_VOICEMAIL }, () => {
      this._onSendToVoicemail();
    });
  }

  hangup() {
    this._eventQueue.push({ name: CallFsmEvent.HANGUP }, () => {
      this._onHangup();
    });
  }

  flip(target: number) {
    this._eventQueue.push(
      { name: CallFsmEvent.FLIP, params: target },
      (params: any) => {
        this._onFlip(params);
      },
    );
  }

  startRecord(): void {
    this._eventQueue.push({ name: CallFsmEvent.START_RECORD }, () => {
      this._onStartRecord();
    });
  }

  stopRecord(): void {
    this._eventQueue.push({ name: CallFsmEvent.STOP_RECORD }, () => {
      this._onStopRecord();
    });
  }

  mute(direction: RTC_CALL_ACTION_DIRECTION): void {
    this._eventQueue.push({ name: CallFsmEvent.MUTE }, () => {
      this._onMute(direction);
    });
  }

  unmute(direction: RTC_CALL_ACTION_DIRECTION): void {
    this._eventQueue.push({ name: CallFsmEvent.UNMUTE }, () => {
      this._onUnmute(direction);
    });
  }

  park() {
    this._eventQueue.push({ name: CallFsmEvent.PARK }, () => {
      this._onPark();
    });
  }

  transfer(target: string): void {
    this._eventQueue.push(
      { name: CallFsmEvent.TRANSFER, params: target },
      (params: any) => {
        this._onTransfer(params);
      },
    );
  }

  warmTransfer(targetSession: any): void {
    this._eventQueue.push(
      { name: CallFsmEvent.WARM_TRANSFER, params: targetSession },
      (params: any) => {
        this._onWarmTransfer(params);
      },
    );
  }

  forward(target: string): void {
    this._eventQueue.push(
      { name: CallFsmEvent.FORWARD, params: target },
      (params: any) => {
        this._onForward(params);
      },
    );
  }

  hold(): void {
    this._eventQueue.push({ name: CallFsmEvent.HOLD }, () => {
      this._onHold();
    });
  }

  unhold(): void {
    this._eventQueue.push({ name: CallFsmEvent.UNHOLD }, () => {
      this._onUnhold();
    });
  }

  dtmf(digits: string): void {
    this._eventQueue.push(
      { name: CallFsmEvent.DTMF, params: digits },
      (params: any) => {
        this._onDtmf(params);
      },
    );
  }

  startReplyWithMessage(): void {
    this._eventQueue.push({ name: CallFsmEvent.START_REPLY }, () => {
      this._onStartReplyWithMessage();
    });
  }

  replyWithMessage(message: string): void {
    this._eventQueue.push({ name: CallFsmEvent.REPLY_WITH_MSG }, () => {
      this._callFsmTable.replyWithMessage(message);
    });
  }

  replyWithPattern(
    pattern: RTC_REPLY_MSG_PATTERN,
    time: number,
    timeUnit: RTC_REPLY_MSG_TIME_UNIT,
  ): void {
    this._eventQueue.push({ name: CallFsmEvent.REPLY_WITH_MSG }, () => {
      this._callFsmTable.replyWithPattern(pattern, time, timeUnit);
    });
  }

  accountReady() {
    this._eventQueue.push({ name: CallFsmEvent.ACCOUNT_READY }, () => {
      this._onAccountReady();
    });
  }

  accountNotReady() {
    this._eventQueue.push({ name: CallFsmEvent.ACCOUNT_NOT_READY }, () => {
      this._onAccountNotReady();
    });
  }

  sessionAccepted() {
    this._eventQueue.push({ name: CallFsmEvent.SESSION_ACCEPTED }, () => {
      this._onSessionAccepted();
    });
  }

  sessionConfirmed() {
    this._eventQueue.push({ name: CallFsmEvent.SESSION_CONFIRMED }, () => {
      this._onSessionConfirmed();
    });
  }

  sessionDisconnected() {
    this._eventQueue.push({ name: CallFsmEvent.SESSION_DISCONNECTED }, () => {
      this._onSessionDisconnected();
    });
  }

  holdSuccess() {
    this._eventQueue.push({ name: CallFsmEvent.HOLD_SUCCESS }, () => {
      this._onHoldSuccess();
    });
  }

  holdFailed() {
    this._eventQueue.push({ name: CallFsmEvent.HOLD_FAILED }, () => {
      this._onHoldFailed();
    });
  }

  unholdSuccess() {
    this._eventQueue.push({ name: CallFsmEvent.UNHOLD_SUCCESS }, () => {
      this._onUnholdSuccess();
    });
  }

  unholdFailed() {
    this._eventQueue.push({ name: CallFsmEvent.UNHOLD_FAILED }, () => {
      this._onUnholdFailed();
    });
  }

  sessionError() {
    this._eventQueue.push({ name: CallFsmEvent.SESSION_ERROR }, () => {
      this._onSessionError();
    });
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

  onWarmTransferAction(targetSession: any) {
    this.emit(CALL_FSM_NOTIFY.WARM_TRANSFER_ACTION, targetSession);
  }

  onForwardAction(target: string) {
    this.emit(CALL_FSM_NOTIFY.FORWARD_ACTION, target);
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

  onMuteAction(direction: RTC_CALL_ACTION_DIRECTION) {
    this.emit(CALL_FSM_NOTIFY.MUTE_ACTION, direction);
  }

  onUnmuteAction(direction: RTC_CALL_ACTION_DIRECTION) {
    this.emit(CALL_FSM_NOTIFY.UNMUTE_ACTION, direction);
  }

  onReportCallActionFailed(name: string): void {
    this.emit(
      CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
      name,
      RTC_CALL_ACTION_ERROR_CODE.INVALID,
    );
  }

  onHoldAction(): void {
    this.emit(CALL_FSM_NOTIFY.HOLD_ACTION);
  }

  onUnholdAction(): void {
    this.emit(CALL_FSM_NOTIFY.UNHOLD_ACTION);
  }

  onHoldSuccessAction(): void {
    this.emit(CALL_FSM_NOTIFY.HOLD_SUCCESS_ACTION);
  }

  onHoldFailedAction(): void {
    this.emit(CALL_FSM_NOTIFY.HOLD_FAILED_ACTION);
  }

  onUnholdSuccessAction(): void {
    this.emit(CALL_FSM_NOTIFY.UNHOLD_SUCCESS_ACTION);
  }

  onUnholdFailedAction(): void {
    this.emit(CALL_FSM_NOTIFY.UNHOLD_FAILED_ACTION);
  }

  onDtmfAction(digits: string) {
    this.emit(CALL_FSM_NOTIFY.DTMF_ACTION, digits);
  }

  onStartReplyAction() {
    this.emit(CALL_FSM_NOTIFY.START_REPLY_ACTION);
  }

  onReplyWithPatternAction(
    pattern: RTC_REPLY_MSG_PATTERN,
    time: number,
    timeUnit: RTC_REPLY_MSG_TIME_UNIT,
  ): void {
    this.emit(
      CALL_FSM_NOTIFY.REPLY_WITH_PATTERN_ACTION,
      pattern,
      time,
      timeUnit,
    );
  }

  onReplyWithMessageAction(msg: string) {
    this.emit(CALL_FSM_NOTIFY.REPLY_WITH_MESSAGE_ACTION, msg);
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

  private _onWarmTransfer(targetSession: any) {
    this._callFsmTable.warmTransfer(targetSession);
  }

  private _onForward(target: string) {
    this._callFsmTable.forward(target);
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

  private _onMute(direction: RTC_CALL_ACTION_DIRECTION) {
    this._callFsmTable.mute(direction);
  }

  private _onUnmute(direction: RTC_CALL_ACTION_DIRECTION) {
    this._callFsmTable.unmute(direction);
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

  private _onHold() {
    this._callFsmTable.hold();
  }

  private _onUnhold() {
    this._callFsmTable.unhold();
  }

  private _onDtmf(digits: string) {
    this._callFsmTable.dtmf(digits);
  }

  private _onStartReplyWithMessage() {
    this._callFsmTable.startReplyWithMessage();
  }

  private _onAccountReady() {
    this._callFsmTable.accountReady();
  }

  private _onAccountNotReady() {
    this._callFsmTable.accountNotReady();
  }

  private _onSessionAccepted() {
    this._callFsmTable.sessionAccepted();
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

  private _onHoldSuccess() {
    this._callFsmTable.holdSuccess();
  }

  private _onHoldFailed() {
    this._callFsmTable.holdFailed();
  }

  private _onUnholdSuccess() {
    this._callFsmTable.unholdSuccess();
  }

  private _onUnholdFailed() {
    this._callFsmTable.unholdFailed();
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

  private _onLeaveConnected() {
    this.emit(CALL_FSM_NOTIFY.LEAVE_CONNECTED);
  }

  onUpdateFsmState(state: FsmStatusCategory): void {
    this._report.updateFsmStatus(state);
  }
}

export { RTCCallFsm };
