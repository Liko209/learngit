/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2018-12-29 16:08:40
 * Copyright © RingCentral. All rights reserved.
 */
import StateMachine from 'ts-javascript-state-machine';
import {
  RTC_CALL_ACTION,
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
  RTC_CALL_ACTION_DIRECTION,
} from '../api/types';
import { rtcLogger } from '../utils/RTCLoggerProxy';
import { FsmStatusCategory } from '../report/types';

const CallFsmState = {
  IDLE: 'idle',
  PENDING: 'pending',
  ANSWERING: 'answering',
  REPLYING: 'replying',
  FORWARDING: 'forwarding',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  HOLDING: 'holding',
  HOLDED: 'holded',
  UNHOLDING: 'unholding',
  DISCONNECTED: 'disconnected',
};

const CallFsmEvent = {
  ACCOUNT_READY: 'accountReady',
  ACCOUNT_NOT_READY: 'accountNotReady',
  ANSWER: 'answer',
  REJECT: 'reject',
  IGNORE: 'ignore',
  SEND_TO_VOICEMAIL: 'sendToVoicemail',
  HANGUP: 'hangup',
  FLIP: 'flip',
  MUTE: 'mute',
  UNMUTE: 'Unmute',
  TRANSFER: 'transfer',
  WARM_TRANSFER: 'warmTransfer',
  FORWARD: 'forward',
  START_RECORD: 'startRecord',
  STOP_RECORD: 'stopRecord',
  HOLD: 'hold',
  UNHOLD: 'unhold',
  PARK: 'park',
  DTMF: 'dtmf',
  START_REPLY: 'startReplyWithMessage',
  REPLY_WITH_MESSAGE: 'replyWithMessage',
  REPLY_WITH_PATTERN: 'replyWithPattern',
  SESSION_ACCEPTED: 'sessionAccepted',
  SESSION_CONFIRMED: 'sessionConfirmed',
  SESSION_DISCONNECTED: 'sessionDisconnected',
  SESSION_ERROR: 'sessionError',
  HOLD_SUCCESS: 'holdSuccess',
  HOLD_FAILED: 'holdFailed',
  UNHOLD_SUCCESS: 'unholdSuccess',
  UNHOLD_FAILED: 'unholdFailed',
};

interface IRTCCallFsmTableDependency {
  onCreateOutCallSession(): void;
  onAnswerAction(): void;
  onRejectAction(): void;
  onSendToVoicemailAction(): void;
  onHangupAction(): void;
  onFlipAction(target: number): void;
  onTransferAction(target: string): void;
  onWarmTransferAction(targetSession: any): void;
  onForwardAction(target: string): void;
  onStartRecordAction(): void;
  onStopRecordAction(): void;
  onMuteAction(direction: RTC_CALL_ACTION_DIRECTION): void;
  onUnmuteAction(direction: RTC_CALL_ACTION_DIRECTION): void;
  onHoldSuccessAction(): void;
  onHoldFailedAction(): void;
  onUnholdSuccessAction(): void;
  onUnholdFailedAction(): void;
  onReportCallActionFailed(name: string): void;
  onHoldAction(): void;
  onUnholdAction(): void;
  onParkAction(): void;
  onDtmfAction(digits: string): void;
  onStartReplyAction(): void;
  onReplyWithMessageAction(msg: string): void;
  onReplyWithPatternAction(
    pattern: RTC_REPLY_MSG_PATTERN,
    time: number,
    timeUnit: RTC_REPLY_MSG_TIME_UNIT,
  ): void;
  onUpdateFsmState(state: FsmStatusCategory): void;
}

class RTCCallFsmTable extends StateMachine {
  constructor(dependency: IRTCCallFsmTableDependency) {
    super({
      init: CallFsmState.IDLE,
      transitions: [
        {
          name: CallFsmEvent.ACCOUNT_READY,
          from: [CallFsmState.IDLE, CallFsmState.PENDING],
          to: () => {
            dependency.onCreateOutCallSession();
            return CallFsmState.CONNECTING;
          },
        },
        {
          name: CallFsmEvent.ACCOUNT_NOT_READY,
          from: CallFsmState.IDLE,
          to: CallFsmState.PENDING,
        },
        {
          name: CallFsmEvent.ANSWER,
          from: [CallFsmState.IDLE, CallFsmState.REPLYING],
          to: () => {
            dependency.onAnswerAction();
            return CallFsmState.ANSWERING;
          },
        },
        {
          name: CallFsmEvent.REJECT,
          from: [CallFsmState.IDLE, CallFsmState.REPLYING],
          to: () => {
            dependency.onRejectAction();
            return CallFsmState.DISCONNECTED;
          },
        },
        {
          name: CallFsmEvent.IGNORE,
          from: [CallFsmState.IDLE, CallFsmState.REPLYING],
          to: CallFsmState.DISCONNECTED,
        },
        {
          name: CallFsmEvent.SEND_TO_VOICEMAIL,
          from: [CallFsmState.IDLE, CallFsmState.REPLYING],
          to: () => {
            dependency.onSendToVoicemailAction();
            return CallFsmState.DISCONNECTED;
          },
        },
        {
          name: CallFsmEvent.START_REPLY,
          from: CallFsmState.IDLE,
          to: () => {
            dependency.onStartReplyAction();
            return CallFsmState.REPLYING;
          },
        },
        {
          name: CallFsmEvent.START_REPLY,
          from: [
            CallFsmState.ANSWERING,
            CallFsmState.PENDING,
            CallFsmState.CONNECTING,
            CallFsmState.CONNECTED,
            CallFsmState.HOLDING,
            CallFsmState.HOLDED,
            CallFsmState.UNHOLDING,
            CallFsmState.FORWARDING,
            CallFsmState.REPLYING,
          ],
          to: () => {
            dependency.onReportCallActionFailed(RTC_CALL_ACTION.START_REPLY);
            return undefined;
          },
        },
        {
          name: CallFsmEvent.REPLY_WITH_MESSAGE,
          from: CallFsmState.REPLYING,
          to: (msg: string) => {
            dependency.onReplyWithMessageAction(msg);
            return CallFsmState.DISCONNECTED;
          },
        },
        {
          name: CallFsmEvent.REPLY_WITH_MESSAGE,
          from: [
            CallFsmState.IDLE,
            CallFsmState.ANSWERING,
            CallFsmState.PENDING,
            CallFsmState.CONNECTING,
            CallFsmState.CONNECTED,
            CallFsmState.HOLDING,
            CallFsmState.HOLDED,
            CallFsmState.UNHOLDING,
            CallFsmState.FORWARDING,
          ],
          to: () => {
            dependency.onReportCallActionFailed(RTC_CALL_ACTION.REPLY_WITH_MSG);
            return undefined;
          },
        },
        {
          name: CallFsmEvent.REPLY_WITH_PATTERN,
          from: CallFsmState.REPLYING,
          to: (
            pattern: RTC_REPLY_MSG_PATTERN,
            time: number,
            timeUnit: RTC_REPLY_MSG_TIME_UNIT,
          ) => {
            dependency.onReplyWithPatternAction(pattern, time, timeUnit);
            return CallFsmState.DISCONNECTED;
          },
        },
        {
          name: CallFsmEvent.REPLY_WITH_PATTERN,
          from: [
            CallFsmState.IDLE,
            CallFsmState.ANSWERING,
            CallFsmState.PENDING,
            CallFsmState.CONNECTING,
            CallFsmState.CONNECTED,
            CallFsmState.HOLDING,
            CallFsmState.HOLDED,
            CallFsmState.UNHOLDING,
            CallFsmState.FORWARDING,
          ],
          to: () => {
            dependency.onReportCallActionFailed(
              RTC_CALL_ACTION.REPLY_WITH_PATTERN,
            );
            return undefined;
          },
        },
        {
          name: CallFsmEvent.HANGUP,
          from: [
            CallFsmState.IDLE,
            CallFsmState.ANSWERING,
            CallFsmState.PENDING,
            CallFsmState.CONNECTING,
            CallFsmState.CONNECTED,
            CallFsmState.HOLDING,
            CallFsmState.HOLDED,
            CallFsmState.UNHOLDING,
            CallFsmState.FORWARDING,
            CallFsmState.REPLYING,
          ],
          to: () => {
            dependency.onHangupAction();
            return CallFsmState.DISCONNECTED;
          },
        },
        {
          name: CallFsmEvent.FLIP,
          from: CallFsmState.CONNECTED,
          to: (target: number) => {
            dependency.onFlipAction(target);
            return CallFsmState.CONNECTED;
          },
        },
        {
          name: CallFsmEvent.MUTE,
          from: CallFsmState.CONNECTED,
          to: (direction: RTC_CALL_ACTION_DIRECTION) => {
            dependency.onMuteAction(direction);
            return CallFsmState.CONNECTED;
          },
        },
        {
          name: CallFsmEvent.UNMUTE,
          from: CallFsmState.CONNECTED,
          to: (direction: RTC_CALL_ACTION_DIRECTION) => {
            dependency.onUnmuteAction(direction);
            return CallFsmState.CONNECTED;
          },
        },
        {
          name: CallFsmEvent.TRANSFER,
          from: CallFsmState.CONNECTED,
          to: (target: string) => {
            dependency.onTransferAction(target);
            return CallFsmState.CONNECTED;
          },
        },
        {
          name: CallFsmEvent.WARM_TRANSFER,
          from: [
            CallFsmState.CONNECTED,
            CallFsmState.HOLDING,
            CallFsmState.HOLDED,
            CallFsmState.UNHOLDING,
          ],
          to: (targetSession: any) => {
            dependency.onWarmTransferAction(targetSession);
            return undefined;
          },
        },
        {
          name: CallFsmEvent.FORWARD,
          from: [CallFsmState.IDLE, CallFsmState.REPLYING],
          to: (target: string) => {
            dependency.onForwardAction(target);
            return CallFsmState.FORWARDING;
          },
        },
        {
          name: CallFsmEvent.PARK,
          from: CallFsmState.CONNECTED,
          to: () => {
            dependency.onParkAction();
            return CallFsmState.CONNECTED;
          },
        },
        {
          name: CallFsmEvent.PARK,
          from: [
            CallFsmState.IDLE,
            CallFsmState.ANSWERING,
            CallFsmState.CONNECTING,
            CallFsmState.DISCONNECTED,
            CallFsmState.PENDING,
            CallFsmState.HOLDING,
            CallFsmState.HOLDED,
            CallFsmState.UNHOLDING,
            CallFsmState.FORWARDING,
          ],
          to: () => {
            dependency.onReportCallActionFailed(RTC_CALL_ACTION.PARK);
            return undefined;
          },
        },
        {
          name: CallFsmEvent.TRANSFER,
          from: [
            CallFsmState.IDLE,
            CallFsmState.ANSWERING,
            CallFsmState.CONNECTING,
            CallFsmState.DISCONNECTED,
            CallFsmState.PENDING,
            CallFsmState.HOLDING,
            CallFsmState.HOLDED,
            CallFsmState.UNHOLDING,
            CallFsmState.FORWARDING,
          ],
          to: (target: string, s: any) => {
            dependency.onReportCallActionFailed(RTC_CALL_ACTION.TRANSFER);
            return s;
          },
        },
        {
          name: CallFsmEvent.WARM_TRANSFER,
          from: [
            CallFsmState.IDLE,
            CallFsmState.ANSWERING,
            CallFsmState.CONNECTING,
            CallFsmState.DISCONNECTED,
            CallFsmState.PENDING,
            CallFsmState.FORWARDING,
            CallFsmState.REPLYING,
          ],
          to: (targetSession: any, s: any) => {
            dependency.onReportCallActionFailed(RTC_CALL_ACTION.WARM_TRANSFER);
            return s;
          },
        },
        {
          name: CallFsmEvent.FORWARD,
          from: [
            CallFsmState.CONNECTED,
            CallFsmState.ANSWERING,
            CallFsmState.CONNECTING,
            CallFsmState.DISCONNECTED,
            CallFsmState.PENDING,
            CallFsmState.HOLDING,
            CallFsmState.HOLDED,
            CallFsmState.UNHOLDING,
            CallFsmState.FORWARDING,
          ],
          to: (target: string, s: any) => {
            dependency.onReportCallActionFailed(RTC_CALL_ACTION.FORWARD);
            return s;
          },
        },
        {
          name: CallFsmEvent.FLIP,
          from: [
            CallFsmState.IDLE,
            CallFsmState.ANSWERING,
            CallFsmState.CONNECTING,
            CallFsmState.DISCONNECTED,
            CallFsmState.PENDING,
            CallFsmState.HOLDING,
            CallFsmState.HOLDED,
            CallFsmState.UNHOLDING,
            CallFsmState.FORWARDING,
          ],
          to: (target: number, s: any) => {
            dependency.onReportCallActionFailed(RTC_CALL_ACTION.FLIP);
            return s;
          },
        },
        {
          name: CallFsmEvent.START_RECORD,
          from: CallFsmState.CONNECTED,
          to: () => {
            dependency.onStartRecordAction();
            return CallFsmState.CONNECTED;
          },
        },
        {
          name: CallFsmEvent.START_RECORD,
          from: [
            CallFsmState.IDLE,
            CallFsmState.ANSWERING,
            CallFsmState.CONNECTING,
            CallFsmState.DISCONNECTED,
            CallFsmState.PENDING,
            CallFsmState.HOLDING,
            CallFsmState.HOLDED,
            CallFsmState.UNHOLDING,
            CallFsmState.FORWARDING,
          ],
          to: () => {
            dependency.onReportCallActionFailed(RTC_CALL_ACTION.START_RECORD);
            return undefined;
          },
        },
        {
          name: CallFsmEvent.STOP_RECORD,
          from: CallFsmState.CONNECTED,
          to: () => {
            dependency.onStopRecordAction();
            return CallFsmState.CONNECTED;
          },
        },
        {
          name: CallFsmEvent.STOP_RECORD,
          from: [
            CallFsmState.IDLE,
            CallFsmState.ANSWERING,
            CallFsmState.CONNECTING,
            CallFsmState.DISCONNECTED,
            CallFsmState.PENDING,
            CallFsmState.HOLDING,
            CallFsmState.HOLDED,
            CallFsmState.UNHOLDING,
            CallFsmState.FORWARDING,
          ],
          to: () => {
            dependency.onReportCallActionFailed(RTC_CALL_ACTION.STOP_RECORD);
            return undefined;
          },
        },
        {
          name: CallFsmEvent.HOLD,
          from: CallFsmState.CONNECTED,
          to: () => {
            dependency.onHoldAction();
            return CallFsmState.HOLDING;
          },
        },
        {
          name: CallFsmEvent.HOLD_SUCCESS,
          from: CallFsmState.HOLDING,
          to: () => {
            dependency.onHoldSuccessAction();
            return CallFsmState.HOLDED;
          },
        },
        {
          name: CallFsmEvent.HOLD_FAILED,
          from: CallFsmState.HOLDING,
          to: () => {
            dependency.onHoldFailedAction();
            return CallFsmState.CONNECTED;
          },
        },
        {
          name: CallFsmEvent.UNHOLD,
          from: CallFsmState.HOLDED,
          to: () => {
            dependency.onUnholdAction();
            return CallFsmState.UNHOLDING;
          },
        },
        {
          name: CallFsmEvent.UNHOLD_SUCCESS,
          from: CallFsmState.UNHOLDING,
          to: () => {
            dependency.onUnholdSuccessAction();
            return CallFsmState.CONNECTED;
          },
        },
        {
          name: CallFsmEvent.UNHOLD_FAILED,
          from: CallFsmState.UNHOLDING,
          to: () => {
            dependency.onUnholdFailedAction();
            return CallFsmState.HOLDED;
          },
        },
        {
          name: CallFsmEvent.DTMF,
          from: [
            CallFsmState.CONNECTING,
            CallFsmState.CONNECTED,
            CallFsmState.ANSWERING,
            CallFsmState.HOLDING,
            CallFsmState.HOLDED,
            CallFsmState.UNHOLDING,
            CallFsmState.FORWARDING,
          ],
          to: (digits: string) => {
            dependency.onDtmfAction(digits);
            return undefined;
          },
        },
        {
          name: CallFsmEvent.SESSION_ACCEPTED,
          from: CallFsmState.CONNECTING,
          to: CallFsmState.CONNECTED,
        },
        {
          name: CallFsmEvent.SESSION_CONFIRMED,
          from: CallFsmState.ANSWERING,
          to: CallFsmState.CONNECTED,
        },
        {
          name: CallFsmEvent.SESSION_DISCONNECTED,
          from: [
            CallFsmState.IDLE,
            CallFsmState.ANSWERING,
            CallFsmState.REPLYING,
            CallFsmState.CONNECTING,
            CallFsmState.CONNECTED,
            CallFsmState.HOLDING,
            CallFsmState.HOLDED,
            CallFsmState.UNHOLDING,
            CallFsmState.FORWARDING,
          ],
          to: CallFsmState.DISCONNECTED,
        },
        {
          name: CallFsmEvent.SESSION_ERROR,
          from: [
            CallFsmState.IDLE,
            CallFsmState.ANSWERING,
            CallFsmState.REPLYING,
            CallFsmState.CONNECTING,
            CallFsmState.CONNECTED,
            CallFsmState.HOLDING,
            CallFsmState.HOLDED,
            CallFsmState.UNHOLDING,
            CallFsmState.FORWARDING,
          ],
          to: CallFsmState.DISCONNECTED,
        },
      ],
      methods: {
        onTransition(lifecycle) {
          dependency && dependency.onUpdateFsmState(lifecycle.to as FsmStatusCategory);
          rtcLogger.debug(
            'RTC_Call_FSM',
            `Transition: ${lifecycle.transition} from: ${lifecycle.from} to: ${
              lifecycle.to
            }`,
          );
          return true;
        },
        onInvalidTransition(transition: any, from: any, to: any) {
          rtcLogger.debug(
            'RTC_Call_FSM',
            `Invalid transition: ${transition} from: ${from} to: ${to}`,
          );
        },
        onPendingTransition(transition: any, from: any, to: any) {
          rtcLogger.debug(
            'RTC_Call_FSM',
            `Pending transition: ${transition} from: ${from} to: ${to}`,
          );
        },
      },
    });
  }
}

export { RTCCallFsmTable, IRTCCallFsmTableDependency, CallFsmState };
