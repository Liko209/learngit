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
  SESSION_CONFIRMED: 'sessionConfirmed',
  SESSION_DISCONNECTED: 'sessionDisconnected',
  SESSION_ERROR: 'sessionError',
};

class RTCCallFsmTable extends StateMachine {
  constructor() {
    super({
      init: CallFsmState.IDLE,
      transitions: [
        {
          name: CallFsmEvent.ACCOUNT_READY,
          from: [CallFsmState.IDLE, CallFsmState.PENDING],
          to: CallFsmState.CONNECTING,
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
          to: CallFsmState.DISCONNECTED,
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

export { RTCCallFsmTable };
