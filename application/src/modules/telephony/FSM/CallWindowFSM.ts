/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-02-28 18:18:53
 * Copyright © RingCentral. All rights reserved.
 */

import StateMachine from 'ts-javascript-state-machine';
import { mainLogger } from 'foundation/log';

const logTag = '[Call_Window_FSM]';

enum CALL_WINDOW_STATUS {
  MINIMIZED = 'minimized',
  DETACHED = 'detached',
  FLOATING = 'floating',
}

enum CALL_WINDOW_TRANSITION_NAMES {
  DETACHED_WINDOW = 'detachedWindow',
  ATTACHED_WINDOW = 'attachedWindow',
  OPEN_FLOATING_DIALER = 'openFloatingDialer',
  OPEN_DETACHED_DIALER = 'openDetachedDialer',
  CLOSE_DIALER = 'closeDialer',
}

const CallWindowFSM = StateMachine.factory({
  init: CALL_WINDOW_STATUS.MINIMIZED,
  transitions: [
    {
      name: CALL_WINDOW_TRANSITION_NAMES.OPEN_FLOATING_DIALER,
      from: CALL_WINDOW_STATUS.MINIMIZED,
      to: CALL_WINDOW_STATUS.FLOATING,
    },
    {
      name: CALL_WINDOW_TRANSITION_NAMES.CLOSE_DIALER,
      from: [CALL_WINDOW_STATUS.FLOATING, CALL_WINDOW_STATUS.DETACHED],
      to: CALL_WINDOW_STATUS.MINIMIZED,
    },
    {
      name: CALL_WINDOW_TRANSITION_NAMES.OPEN_DETACHED_DIALER,
      from: CALL_WINDOW_STATUS.MINIMIZED,
      to: CALL_WINDOW_STATUS.DETACHED,
    },
    {
      name: CALL_WINDOW_TRANSITION_NAMES.DETACHED_WINDOW,
      from: CALL_WINDOW_STATUS.FLOATING,
      to: CALL_WINDOW_STATUS.DETACHED,
    },
    {
      name: CALL_WINDOW_TRANSITION_NAMES.ATTACHED_WINDOW,
      from: CALL_WINDOW_STATUS.DETACHED,
      to: CALL_WINDOW_STATUS.FLOATING,
    },
  ],
  methods: {
    onTransition(lifecycle) {
      mainLogger.debug(
        `${logTag} Transition: ${lifecycle.transition} from: ${
          lifecycle.from
        } to: ${lifecycle.to}`,
      );
      return true;
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

export { CallWindowFSM, CALL_WINDOW_TRANSITION_NAMES, CALL_WINDOW_STATUS };
