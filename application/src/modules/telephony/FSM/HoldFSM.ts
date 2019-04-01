/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-01 10:42:38
 * Copyright © RingCentral. All rights reserved.
 */
import StateMachine from 'ts-javascript-state-machine';
// @ts-ignore
import StateMachineHistory from 'ts-javascript-state-machine/dist/state-machine-history';
import { mainLogger } from 'sdk';

const logTag = '[Hold_Status_FSM]';

enum HOLD_STATE {
  IDLE = 'idle',
  HOLDED = 'holded',
  DISABLED = 'disabled',
}

enum HOLD_TRANSITION_NAMES {
  HOLD = 'hold',
  UNHOLD = 'unhold',
  CONNECTED = 'connected',
}

const HoldFSM = StateMachine.factory({
  init: HOLD_STATE.DISABLED,
  transitions: [
    {
      name: HOLD_TRANSITION_NAMES.CONNECTED,
      from: HOLD_STATE.DISABLED,
      to: HOLD_STATE.IDLE,
    },
    {
      name: HOLD_TRANSITION_NAMES.HOLD,
      from: HOLD_STATE.IDLE,
      to: HOLD_STATE.HOLDED,
    },
    {
      name: HOLD_TRANSITION_NAMES.UNHOLD,
      from: HOLD_STATE.HOLDED,
      to: HOLD_STATE.IDLE,
    },
  ],
  plugins: [new StateMachineHistory()],
  methods: {
    onTransition(lifecycle) {
      const { transition, from, to } = lifecycle;
      mainLogger.debug(
        `${logTag} Transition: ${transition} from: ${from} to: ${to}`,
      );
      return true;
    },
    onAfterTransition(lifecycle) {
      const { to } = lifecycle;
      if (to === HOLD_STATE.DISABLED) {
        this.clearHistory();
      }
    },
    onInvalidTransition(transition: any, from: any, to: any) {
      mainLogger.debug(
        `${logTag} Invalid transition: ${transition} from: ${from} to: ${to}`,
      );
    },
    onPendingTransition(transition: any, from: any, to: any) {
      mainLogger.debug(
        `${logTag} Pending transition: ${transition} from: ${from} to: ${to}`,
      );
    },
  },
});

export { HoldFSM, HOLD_TRANSITION_NAMES, HOLD_STATE };
