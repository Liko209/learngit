/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 17:21:15
 * Copyright © RingCentral. All rights reserved.
 */
import { CALL_STATE } from '../../FSM';

type DialerProps = {};

type DialerViewProps = {
  callState: CALL_STATE;
  keypadEntered: boolean;
  dialerId: string;
  dialerMinimizeTranslateX: number;
  dialerMinimizeTranslateY: number;
  startMinimizeAnimation: boolean;
  callWindowState: string;
};

export { DialerProps, DialerViewProps };
