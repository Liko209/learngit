/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 17:21:15
 * Copyright © RingCentral. All rights reserved.
 */
import { CALL_STATE } from '../../FSM';

type DialerProps = {};

type DialerViewProps = {
  callState: CALL_STATE;
};

export { DialerProps, DialerViewProps };
