/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2018-12-10 10:42:59
 * Copyright © RingCentral. All rights reserved.
 */

import StateMachine from 'ts-javascript-state-machine';
import { IRTCRegistrationFsmDependency } from './IRTCRegistrationFsmDependency';
import { REGISTRATION_FSM_STATE } from './types';
import { rtcLogger } from '../utils/RTCLoggerProxy';

enum REGISTRATION_FSM_EVENT {
  PROVISION_READY = 'provisionReady',
  REG_SUCCEED = 'regSuccess',
  REG_TIMEOUT = 'regTimeout',
  REG_FAILED = 'regFailed',
  UNREGISTER = 'unregister',
  RE_REGISTER = 'reRegister',
  NETWORK_CHANGE_TO_ONLINE = 'networkChangeToOnline',
}

class RTCRegistrationFSM extends StateMachine {
  constructor(dependency: IRTCRegistrationFsmDependency) {
    super({
      init: REGISTRATION_FSM_STATE.IDLE,
      transitions: [
        {
          name: REGISTRATION_FSM_EVENT.PROVISION_READY,
          from: REGISTRATION_FSM_STATE.IDLE,
          to: (provisionData: any, options: any) => {
            dependency.onProvisionReadyAction(provisionData, options);
            return REGISTRATION_FSM_STATE.IN_PROGRESS;
          },
        },
        {
          name: REGISTRATION_FSM_EVENT.RE_REGISTER,
          from: [
            REGISTRATION_FSM_STATE.IN_PROGRESS,
            REGISTRATION_FSM_STATE.FAILURE,
            REGISTRATION_FSM_STATE.READY,
          ],
          to: () => {
            dependency.onReRegisterAction();
            return REGISTRATION_FSM_STATE.IN_PROGRESS;
          },
        },
        {
          name: REGISTRATION_FSM_EVENT.NETWORK_CHANGE_TO_ONLINE,
          from: [
            REGISTRATION_FSM_STATE.IN_PROGRESS,
            REGISTRATION_FSM_STATE.FAILURE,
            REGISTRATION_FSM_STATE.READY,
          ],
          to: () => {
            dependency.onNetworkChangeToOnlineAction();
            return REGISTRATION_FSM_STATE.IN_PROGRESS;
          },
        },
        // registration in progress
        {
          name: REGISTRATION_FSM_EVENT.REG_SUCCEED,
          from: REGISTRATION_FSM_STATE.IN_PROGRESS,
          to: REGISTRATION_FSM_STATE.READY,
        },
        {
          name: REGISTRATION_FSM_EVENT.REG_TIMEOUT,
          from: [
            REGISTRATION_FSM_STATE.READY,
            REGISTRATION_FSM_STATE.IN_PROGRESS,
          ],
          to: REGISTRATION_FSM_STATE.FAILURE,
        },
        {
          name: REGISTRATION_FSM_EVENT.REG_FAILED,
          from: [
            REGISTRATION_FSM_STATE.IN_PROGRESS,
            REGISTRATION_FSM_STATE.READY,
          ],
          to: REGISTRATION_FSM_STATE.FAILURE,
        },
        // ready
        {
          name: REGISTRATION_FSM_EVENT.UNREGISTER,
          from: REGISTRATION_FSM_STATE.READY,
          to: REGISTRATION_FSM_STATE.UNREGISTERED,
        },
        {
          name: REGISTRATION_FSM_EVENT.REG_SUCCEED,
          from: [REGISTRATION_FSM_STATE.READY, REGISTRATION_FSM_STATE.FAILURE],
          to: () => {
            dependency.onRegistrationAction();
            return REGISTRATION_FSM_STATE.READY;
          },
        },
      ],
      methods: {
        onTransition(lifecycle) {
          rtcLogger.debug(
            'RTC_ACCOUNT_FSM',
            `Transition: ${lifecycle.transition} from: ${lifecycle.from} to: ${
              lifecycle.to
            }`,
          );
          return true;
        },
        onInvalidTransition(transition: any, from: any, to: any) {
          rtcLogger.debug(
            'RTC_ACCOUNT_FSM',
            `Invalid transition: ${transition} from: ${from} to: ${to}`,
          );
        },
        onPendingTransition(transition: any, from: any, to: any) {
          rtcLogger.debug(
            'RTC_ACCOUNT_FSM',
            `Pending transition: ${transition} from: ${from} to: ${to}`,
          );
        },
      },
    });
  }
}

export { RTCRegistrationFSM };
