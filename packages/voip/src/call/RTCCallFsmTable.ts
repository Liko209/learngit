import StateMachine from 'ts-javascript-state-machine';

const CallFsmState = {
  IDLE: 'idle',
  PENDING: 'pending',
  ANSWERING: 'answering',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
};

const CallFsmEvent = {
  ACCOUNT_READY: 'accountReady',
  ACCOUNT_NOT_READY: 'accountNotReady',
  ANSWER: 'answer',
  REJECT: 'reject',
  SEND_TO_VOICEMAIL: 'sendToVoicemail',
  HANGUP: 'hangup',
  SESSION_CONFIRMED: 'sessionConfirmed',
  SESSION_DISCONNECTED: 'sessionDisconnected',
  SESSION_ERROR: 'sessionError',
};

interface IRTCCallFsmTableDependency {
  onCreateOutCallSession(): void;
  onAnswerAction(): void;
  onRejectAction(): void;
  onSendToVoicemailAction(): void;
  onHangupAction(): void;
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
          ],
          to: () => {
            dependency.onHangupAction();
            return CallFsmState.DISCONNECTED;
          },
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
          ],
          to: CallFsmState.DISCONNECTED,
        },
        {
          name: CallFsmEvent.SESSION_ERROR,
          from: [
            CallFsmState.ANSWERING,
            CallFsmState.CONNECTING,
            CallFsmState.CONNECTED,
          ],
          to: CallFsmState.DISCONNECTED,
        },
        // Only for unit test
        {
          name: 'goto',
          from: '*',
          to: (s: any) => {
            return s;
          },
        },
      ],
      methods: {
        onTransition(lifecycle) {
          console.log(
            'Call FSM: Transition: %s from: %s to: %s',
            String(lifecycle.transition),
            String(lifecycle.from),
            String(lifecycle.to),
          );
          return true;
        },
        onInvalidTransition(transition: any, from: any, to: any) {
          console.log(
            'Call FSM: Invalid transition: %s from: %s to: %s',
            String(transition),
            String(from),
            String(to),
          );
        },
        onPendingTransition(transition: any, from: any, to: any) {
          console.log(
            'Call FSM: Pending transition: %s from: %s to: %s',
            String(transition),
            String(from),
            String(to),
          );
        },
      },
    });
  }
}

export { RTCCallFsmTable, IRTCCallFsmTableDependency };
