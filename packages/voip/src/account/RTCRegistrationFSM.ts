/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2018-12-10 10:42:59
 * Copyright © RingCentral. All rights reserved.
 */

import StateMachine from 'ts-javascript-state-machine';
import { RegistrationState } from './types';
import { IConditionalHandler } from './IConditionalHandler';

const RegistrationEvent = {
  PROVISION_READY: 'provisionReady',
  REG_SUCCEED: 'regSucceed',
  REG_TIMEOUT: 'regTimeOut',
  REG_ERROR: 'regError',
  UN_REGISTER: 'unRegister',
};

class RTCRegistrationFSM extends StateMachine {
  constructor(handler: IConditionalHandler) {
    super({
      init: RegistrationState.IDLE,
      transitions: [
        {
          name: RegistrationEvent.PROVISION_READY,
          from: RegistrationState.IDLE,
          to: (provisionData: any, options: any) => {
            handler.onProvisionReadyAction(provisionData, options);
            return RegistrationState.REG_IN_PROGRESS;
          },
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
          name: RegistrationEvent.UN_REGISTER,
          from: RegistrationState.READY,
          to: RegistrationState.UN_REGISTERED,
        },
        {
          name: RegistrationEvent.REG_SUCCEED,
          from: RegistrationState.READY,
          to: () => {
            handler.onReadyWhenRegSucceedAction();
            return RegistrationState.READY;
          },
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

export { RTCRegistrationFSM };
