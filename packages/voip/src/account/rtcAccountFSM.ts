import StateMachine from 'ts-javascript-state-machine';

const AccountFSMState = {
  IDLE: 'idle',
  REG_IN_PROGRESS: 'regInProgress',
  READY: 'ready',
  REG_FAILURE: 'regFailure',
  UN_REG_IN_PROGRESS: 'unRegInProgress',
  NONE: 'none',
};

const AccountEvent = {
  DO_REGISTER: 'doRegister',
  REG_SUCCEED: 'regSucceed',
  REG_TIMEOUT: 'regTimeOut',
  REG_ERROR: 'regError',
  NETWORK_CHANGED: 'networkChanged',
  DEREGISTER: 'deRegister',
  TERMINATE: 'terminate',
  OUTGOINGCALL: 'outGoingCall',
  DEREG_SUCCEED: 'deRegSucceed',
};

interface IConditionalHandler {
  processReadyOnRegSucceed(): string;
  processReadyOnNetworkChanged(): string;
}

class RTCAccountFSM extends StateMachine {
  constructor(handler: IConditionalHandler) {
    super({
      init: AccountFSMState.IDLE,
      transitions: [
        {
          name: AccountEvent.DO_REGISTER,
          from: AccountFSMState.IDLE,
          to: AccountFSMState.REG_IN_PROGRESS,
        },
        // registration in progress
        {
          name: AccountEvent.REG_SUCCEED,
          from: AccountFSMState.REG_IN_PROGRESS,
          to: AccountFSMState.READY,
        },
        {
          name: AccountEvent.REG_TIMEOUT,
          from: AccountFSMState.REG_IN_PROGRESS,
          to: AccountFSMState.REG_FAILURE,
        },
        {
          name: AccountEvent.REG_ERROR,
          from: AccountFSMState.REG_IN_PROGRESS,
          to: AccountFSMState.REG_FAILURE,
        },
        // ready
        {
          name: AccountEvent.DO_REGISTER,
          from: AccountFSMState.READY,
          to: AccountFSMState.REG_IN_PROGRESS,
        },
        {
          name: AccountEvent.OUTGOINGCALL,
          from: AccountFSMState.READY,
          to: AccountFSMState.READY,
        },
        {
          name: AccountEvent.DEREGISTER,
          from: AccountFSMState.READY,
          to: AccountFSMState.UN_REG_IN_PROGRESS,
        },
        {
          name: AccountEvent.REG_SUCCEED,
          from: AccountFSMState.READY,
          to: handler.processReadyOnRegSucceed,
        },
        {
          name: AccountEvent.NETWORK_CHANGED,
          from: AccountFSMState.READY,
          to: handler.processReadyOnNetworkChanged,
        },

        // registration failure
        {
          name: AccountEvent.DO_REGISTER,
          from: AccountFSMState.REG_FAILURE,
          to: AccountFSMState.REG_IN_PROGRESS,
        },
        {
          name: AccountEvent.NETWORK_CHANGED,
          from: AccountFSMState.REG_FAILURE,
          to: AccountFSMState.REG_IN_PROGRESS,
        },

        // unRegistration in progress
        {
          name: AccountEvent.DEREG_SUCCEED,
          from: AccountFSMState.UN_REG_IN_PROGRESS,
          to: AccountFSMState.NONE,
        },
        {
          name: AccountEvent.TERMINATE,
          from: AccountFSMState.UN_REG_IN_PROGRESS,
          to: AccountFSMState.NONE,
        },
      ],
      methods: {
        onTransition(lifecycle) {
          const tran: string = String(lifecycle.transition);
          const frm: string = String(lifecycle.from);
          const to: string = String(lifecycle.to);
          console.log('Account FSM: event: %s from: %s to: %s', tran, frm, to);
          return true;
        },
        onInvalidTransition(transition: any, from: any, to: any) {
          console.log(
            'Account FSM invalid: %s from: %s to: %s',
            String(transition),
            String(from),
            String(to),
          );
        },
        onPendingTransition(transition: any, from: any, to: any) {
          console.log(`onPendingTransition ${transition}: ${from} => ${to}`);
        },
      },
    });
  }
}

export { RTCAccountFSM, IConditionalHandler };
