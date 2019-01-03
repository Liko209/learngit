import StateMachine from 'ts-javascript-state-machine';

const CallFsmState = {
  IDLE: 'idle',
  PENDING: 'pending',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
};

const CallFsmEvent = {
  ACCOUNT_READY: 'accountReady',
  ACCOUNT_NOT_READY: 'accountNotReady',
  HANGUP: 'hangup',
  FLIP: 'flip',
  START_RECORD: 'startRecord',
  STOP_RECORD: 'stopRecord',
  SESSION_CONFIRMED: 'sessionConfirmed',
  SESSION_DISCONNECTED: 'sessionDisconnected',
  SESSION_ERROR: 'sessionError',
};

interface IRTCCallFsmTableDependency {
  onCreateOutCallSession(): void;
  onHangupAction(): void;
  onFlipAction(target: number): void;
  onStartRecordAction(): void;
  onStopRecordAction(): void;
  onInvalidTransition(transition: any, from: any, to: any): void;
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
          name: CallFsmEvent.HANGUP,
          from: [
            CallFsmState.IDLE,
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
          name: CallFsmEvent.FLIP,
          from: CallFsmState.CONNECTED,
          to: (target: number) => {
            dependency.onFlipAction(target);
            return CallFsmState.CONNECTED;
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
          name: CallFsmEvent.STOP_RECORD,
          from: CallFsmState.CONNECTED,
          to: () => {
            dependency.onStopRecordAction();
            return CallFsmState.CONNECTED;
          },
        },
        {
          name: CallFsmEvent.SESSION_CONFIRMED,
          from: CallFsmState.CONNECTING,
          to: CallFsmState.CONNECTED,
        },
        {
          name: CallFsmEvent.SESSION_DISCONNECTED,
          from: [CallFsmState.CONNECTING, CallFsmState.CONNECTED],
          to: CallFsmState.DISCONNECTED,
        },
        {
          name: CallFsmEvent.SESSION_ERROR,
          from: [CallFsmState.CONNECTING, CallFsmState.CONNECTED],
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
          dependency.onInvalidTransition(transition, from, to);
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
