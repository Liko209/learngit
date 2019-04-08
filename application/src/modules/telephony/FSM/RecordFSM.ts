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
  DISABLED = 'disabled',
}

enum RECORD_TRANSITION_NAMES {
  START_RECORD = 'startRecord',
  STOP_RECORD = 'stopRecord',
  CONNECTED = 'connected',
  DISCONNECT = 'disconnect',
}

const RecordFSM = StateMachine.factory({
  init: RECORD_STATE.DISABLED,
  transitions: [
    {
      name: RECORD_TRANSITION_NAMES.CONNECTED,
      from: RECORD_STATE.DISABLED,
      to: RECORD_STATE.IDLE,
    },
    {
      name: RECORD_TRANSITION_NAMES.START_RECORD,
      from: [RECORD_STATE.IDLE, RECORD_STATE.DISABLED],
      to: RECORD_STATE.RECORDING,
    },
    {
      name: RECORD_TRANSITION_NAMES.STOP_RECORD,
      from: [RECORD_STATE.RECORDING, RECORD_STATE.DISABLED],
      to: RECORD_STATE.IDLE,
    },
    {
      name: RECORD_TRANSITION_NAMES.DISCONNECT,
      from: [RECORD_STATE.RECORDING, RECORD_STATE.IDLE, RECORD_STATE.DISABLED],
      to: RECORD_STATE.DISABLED,
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
      if (to === RECORD_STATE.DISABLED) {
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

export { RecordFSM, RECORD_TRANSITION_NAMES, RECORD_STATE };
