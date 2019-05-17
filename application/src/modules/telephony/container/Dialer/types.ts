/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 17:21:15
 * Copyright © RingCentral. All rights reserved.
 */
import { CALL_STATE } from '../../FSM';
import { INCOMING_STATE } from '../../store';

type DialerProps = {};

type DialerViewProps = {
  callState: CALL_STATE;
  incomingState: INCOMING_STATE;
  keypadEntered: boolean;
  setAnimationPromise: (p: Promise<any>) => void;
  clearAnimationPromise: () => void;
  dialerId: string;
  dialerMinimizeTranslateX: number;
  dialerMinimizeTranslateY: number;
  shouldAnimationStart: boolean;
  xScale: string;
  yScale: string;
  callWindowState: string;
};

export { DialerProps, DialerViewProps };
