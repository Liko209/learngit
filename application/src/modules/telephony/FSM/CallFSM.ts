/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-02-28 18:18:53
 * Copyright © RingCentral. All rights reserved.
 */

import StateMachine from 'ts-javascript-state-machine';
// @ts-ignore
import StateMachineHistory from 'ts-javascript-state-machine/dist/state-machine-history';
import { mainLogger } from 'sdk';

const logTag = '[Call_Status_FSM]';

enum CALL_STATE {
  IDLE = 'idle',
  DIALING = 'dialing',
  INCOMING = 'incoming',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
}

enum CALL_TRANSITION_NAMES {
  OPEN_DIALER = 'openDialer',
  CLOSE_DIALER = 'closeDialer',
  START_DIALER_CALL = 'startDialerCall',
  START_DIRECT_CALL = 'startDirectCall',
  START_INCOMING_CALL = 'startIncomingCall',
  ANSWER_INCOMING_CALL = 'answerIncomingCall',
  HAS_CONNECTED = 'hasConnected',
  END_DIALER_CALL = 'endDialerCall',
  END_INCOMING_CALL = 'endIncomingCall',
  END_DIRECT_CALL = 'endDirectCall',
  END_WIDGET_CALL = 'endWidgetCall',
}

const CallFSM = StateMachine.factory({
  init: CALL_STATE.IDLE,
  transitions: [
    {
      name: CALL_TRANSITION_NAMES.OPEN_DIALER,
      from: [CALL_STATE.IDLE, CALL_STATE.CONNECTING, CALL_STATE.CONNECTED],
      to() {
        // @ts-ignore
        if (this.state === CALL_STATE.IDLE) {
          return CALL_STATE.DIALING;
        }
        // @ts-ignore
        return this.state;
      },
    },
    {
      name: CALL_TRANSITION_NAMES.START_DIRECT_CALL,
      from: CALL_STATE.IDLE,
      to: CALL_STATE.CONNECTING,
    },
    {
      name: CALL_TRANSITION_NAMES.START_DIALER_CALL,
      from: CALL_STATE.DIALING,
      to: CALL_STATE.CONNECTING,
    },
    {
      name: CALL_TRANSITION_NAMES.START_INCOMING_CALL,
      from: CALL_STATE.IDLE,
      to: CALL_STATE.INCOMING,
    },
    {
      name: CALL_TRANSITION_NAMES.ANSWER_INCOMING_CALL,
      from: CALL_STATE.INCOMING,
      to: CALL_STATE.CONNECTING,
    },
    {
      name: CALL_TRANSITION_NAMES.HAS_CONNECTED,
      from: CALL_STATE.CONNECTING,
      to: CALL_STATE.CONNECTED,
    },
    {
      name: CALL_TRANSITION_NAMES.END_DIALER_CALL,
      from: [CALL_STATE.CONNECTING, CALL_STATE.CONNECTED],
      to: CALL_STATE.DIALING,
    },
    {
      name: CALL_TRANSITION_NAMES.END_INCOMING_CALL,
      from: [CALL_STATE.INCOMING, CALL_STATE.CONNECTING, CALL_STATE.CONNECTED],
      to: CALL_STATE.IDLE,
    },
    {
      name: CALL_TRANSITION_NAMES.END_DIRECT_CALL,
      from: [CALL_STATE.CONNECTING, CALL_STATE.CONNECTED],
      to: CALL_STATE.IDLE,
    },
    {
      name: CALL_TRANSITION_NAMES.END_WIDGET_CALL,
      from: [CALL_STATE.CONNECTING, CALL_STATE.CONNECTED],
      to: CALL_STATE.IDLE,
    },
    {
      name: CALL_TRANSITION_NAMES.CLOSE_DIALER,
      from: [CALL_STATE.DIALING, CALL_STATE.CONNECTING, CALL_STATE.CONNECTED],
      to() {
        // @ts-ignore
        if (this.state === CALL_STATE.DIALING) {
          return CALL_STATE.IDLE;
        }
        // @ts-ignore
        return this.state;
      },
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
      if (to === CALL_STATE.IDLE) {
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

export { CallFSM, CALL_TRANSITION_NAMES, CALL_STATE };
