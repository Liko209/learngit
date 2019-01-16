/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2018-12-29 16:08:40
 * Copyright © RingCentral. All rights reserved.
 */
import StateMachine from 'ts-javascript-state-machine';
import { RTC_CALL_ACTION } from '../api/types';
import { rtcLogger } from '../utils/RTCLoggerProxy';

const CallFsmState = {
  IDLE: 'idle',
  PENDING: 'pending',
  ANSWERING: 'answering',
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
  SEND_TO_VOICEMAIL: 'sendToVoicemail',
  HANGUP: 'hangup',
  FLIP: 'flip',
  TRANSFER: 'transfer',
  START_RECORD: 'startRecord',
  STOP_RECORD: 'stopRecord',
  HOLD: 'hold',
  UNHOLD: 'unhold',
  PARK: 'park',
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
  onStartRecordAction(): void;
  onStopRecordAction(): void;
  onReportCallActionFailed(name: string): void;
  onHoldAction(): void;
  onUnholdAction(): void;
  onParkAction(): void;
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
          from: CallFsmState.IDLE,
          to: () => {
            dependency.onAnswerAction();
            return CallFsmState.ANSWERING;
          },
        },
        {
          name: CallFsmEvent.REJECT,
          from: CallFsmState.IDLE,
          to: () => {
            dependency.onRejectAction();
            return CallFsmState.DISCONNECTED;
          },
        },
        {
          name: CallFsmEvent.SEND_TO_VOICEMAIL,
          from: CallFsmState.IDLE,
          to: () => {
            dependency.onSendToVoicemailAction();
            return CallFsmState.DISCONNECTED;
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
          name: CallFsmEvent.TRANSFER,
          from: CallFsmState.CONNECTED,
          to: (target: string) => {
            dependency.onTransferAction(target);
            return CallFsmState.CONNECTED;
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
          ],
          to: (s: any) => {
            dependency.onReportCallActionFailed(RTC_CALL_ACTION.PARK);
            return s;
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
          ],
          to: (target: string, s: any) => {
            dependency.onReportCallActionFailed(RTC_CALL_ACTION.TRANSFER);
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
          ],
          to: (s: any) => {
            dependency.onReportCallActionFailed(RTC_CALL_ACTION.START_RECORD);
            return s;
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
          ],
          to: (s: any) => {
            dependency.onReportCallActionFailed(RTC_CALL_ACTION.STOP_RECORD);
            return s;
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
          to: CallFsmState.HOLDED,
        },
        {
          name: CallFsmEvent.HOLD_FAILED,
          from: CallFsmState.HOLDING,
          to: CallFsmState.CONNECTED,
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
          to: CallFsmState.CONNECTED,
        },
        {
          name: CallFsmEvent.UNHOLD_FAILED,
          from: CallFsmState.UNHOLDING,
          to: CallFsmState.HOLDED,
        },
        {
          name: CallFsmEvent.SESSION_CONFIRMED,
          from: [CallFsmState.ANSWERING, CallFsmState.CONNECTING],
          to: CallFsmState.CONNECTED,
        },
        {
          name: CallFsmEvent.SESSION_DISCONNECTED,
          from: [
            CallFsmState.IDLE,
            CallFsmState.ANSWERING,
            CallFsmState.CONNECTING,
            CallFsmState.CONNECTED,
            CallFsmState.HOLDING,
            CallFsmState.HOLDED,
            CallFsmState.UNHOLDING,
          ],
          to: CallFsmState.DISCONNECTED,
        },
        {
          name: CallFsmEvent.SESSION_ERROR,
          from: [
            CallFsmState.IDLE,
            CallFsmState.ANSWERING,
            CallFsmState.CONNECTING,
            CallFsmState.CONNECTED,
            CallFsmState.HOLDING,
            CallFsmState.HOLDED,
            CallFsmState.UNHOLDING,
          ],
          to: CallFsmState.DISCONNECTED,
        },
      ],
      methods: {
        onTransition(lifecycle) {
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

export { RTCCallFsmTable, IRTCCallFsmTableDependency };
