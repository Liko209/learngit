/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-01 10:42:38
 * Copyright © RingCentral. All rights reserved.
 */
import StateMachine from 'ts-javascript-state-machine';
// @ts-ignore
import StateMachineHistory from 'ts-javascript-state-machine/dist/state-machine-history';
import { mainLogger } from 'sdk';

const logTag = '[Record_Status_FSM]';

enum RECORD_STATE {
  IDLE = 'idle',
  RECORDING = 'recording',
}

enum RECORD_TRANSITION_NAMES {
  START_RECORD = 'startRecord',
  STOP_RECORD = 'stopRecord',
}

const RecordFSM = StateMachine.factory({
  init: RECORD_STATE.IDLE,
  transitions: [
    {
      name: RECORD_TRANSITION_NAMES.START_RECORD,
      from: RECORD_STATE.IDLE,
      to: RECORD_STATE.RECORDING,
    },
    {
      name: RECORD_TRANSITION_NAMES.STOP_RECORD,
      from: RECORD_STATE.RECORDING,
      to: RECORD_STATE.IDLE,
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
      if (to === RECORD_STATE.IDLE) {
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

enum RECORD_DISABLED_STATE {
  DISABLED = 'disabled',
  ENABLED = 'enabled',
}

enum RECORD_DISABLED_STATE_TRANSITION_NAMES {
  DISABLE = 'disable',
  ENABLE = 'enable',
}

const RecordDisableFSM = StateMachine.factory({
  init: RECORD_DISABLED_STATE.DISABLED,
  transitions: [
    {
      name: RECORD_DISABLED_STATE_TRANSITION_NAMES.DISABLE,
      from: RECORD_DISABLED_STATE.ENABLED,
      to: RECORD_DISABLED_STATE.DISABLED,
    },
    {
      name: RECORD_DISABLED_STATE_TRANSITION_NAMES.ENABLE,
      from: RECORD_DISABLED_STATE.DISABLED,
      to: RECORD_DISABLED_STATE.ENABLED,
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
      if (to === RECORD_DISABLED_STATE.DISABLED) {
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

export {
  RecordFSM,
  RECORD_TRANSITION_NAMES,
  RECORD_STATE,
  RecordDisableFSM,
  RECORD_DISABLED_STATE,
  RECORD_DISABLED_STATE_TRANSITION_NAMES,
};
