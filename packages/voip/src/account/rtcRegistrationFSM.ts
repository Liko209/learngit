/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2018-12-10 10:42:59
 * Copyright © RingCentral. All rights reserved.
 */

import StateMachine from 'ts-javascript-state-machine';

const RegistrationState = {
  IDLE: 'idle',
  REG_IN_PROGRESS: 'regInProgress',
  READY: 'ready',
  REG_FAILURE: 'regFailure',
  UN_REG_IN_PROGRESS: 'unRegInProgress',
  NONE: 'none',
};

const RegistrationEvent = {
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
  onReadyWhenRegSucceed(): string;
  onReadyWhenNetworkChanged(): string;
}

class RTCRegistrationFSM extends StateMachine {
  constructor(handler: IConditionalHandler) {
    super({
      init: RegistrationState.IDLE,
      transitions: [
        {
          name: RegistrationEvent.DO_REGISTER,
          from: RegistrationState.IDLE,
          to: RegistrationState.REG_IN_PROGRESS,
        },
        // registration in progress
        {
          name: RegistrationEvent.REG_SUCCEED,
          from: RegistrationState.REG_IN_PROGRESS,
          to: RegistrationState.READY,
        },
        {
          name: RegistrationEvent.REG_TIMEOUT,
          from: RegistrationState.REG_IN_PROGRESS,
          to: RegistrationState.REG_FAILURE,
        },
        {
          name: RegistrationEvent.REG_ERROR,
          from: RegistrationState.REG_IN_PROGRESS,
          to: RegistrationState.REG_FAILURE,
        },
        // ready
        {
          name: RegistrationEvent.DO_REGISTER,
          from: RegistrationState.READY,
          to: RegistrationState.REG_IN_PROGRESS,
        },
        {
          name: RegistrationEvent.OUTGOINGCALL,
          from: RegistrationState.READY,
          to: RegistrationState.READY,
        },
        {
          name: RegistrationEvent.DEREGISTER,
          from: RegistrationState.READY,
          to: RegistrationState.UN_REG_IN_PROGRESS,
        },
        {
          name: RegistrationEvent.REG_SUCCEED,
          from: RegistrationState.READY,
          to: () => handler.onReadyWhenRegSucceed(),
        },
        {
          name: RegistrationEvent.NETWORK_CHANGED,
          from: RegistrationState.READY,
          to: () => handler.onReadyWhenNetworkChanged(),
        },

        // registration failure
        {
          name: RegistrationEvent.DO_REGISTER,
          from: RegistrationState.REG_FAILURE,
          to: RegistrationState.REG_IN_PROGRESS,
        },
        {
          name: RegistrationEvent.NETWORK_CHANGED,
          from: RegistrationState.REG_FAILURE,
          to: RegistrationState.REG_IN_PROGRESS,
        },

        // unRegistration in progress
        {
          name: RegistrationEvent.DEREG_SUCCEED,
          from: RegistrationState.UN_REG_IN_PROGRESS,
          to: RegistrationState.NONE,
        },
        {
          name: RegistrationEvent.TERMINATE,
          from: RegistrationState.UN_REG_IN_PROGRESS,
          to: RegistrationState.NONE,
        },
      ],
      methods: {
        onTransition(lifecycle) {
          const tran: string = String(lifecycle.transition);
          const frm: string = String(lifecycle.from);
          const to: string = String(lifecycle.to);
          console.log(
            'Registration FSM: event: %s from: %s to: %s',
            tran,
            frm,
            to,
          );
          return true;
        },
        onInvalidTransition(transition: any, from: any, to: any) {
          console.log(
            'Registration FSM invalid: %s from: %s to: %s',
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

export { RTCRegistrationFSM, IConditionalHandler, RegistrationState };
