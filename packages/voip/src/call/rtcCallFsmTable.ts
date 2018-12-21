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

class RtcCallFsmTable extends StateMachine {
  constructor() {
    super({
      init: CallFsmState.IDLE,
      transitions: [
        {
          name: CallFsmEvent.ACCOUNT_READY,
          from: CallFsmState.IDLE,
          to: CallFsmState.CONNECTING,
        },
        {
          name: CallFsmEvent.ACCOUNT_NOT_READY,
          from: CallFsmState.IDLE,
          to: CallFsmState.PENDING,
        },
        {
          name: CallFsmEvent.ACCOUNT_READY,
          from: CallFsmState.PENDING,
          to: CallFsmState.CONNECTING,
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
      methods: {},
    });
  }
}

export { RtcCallFsmTable };
