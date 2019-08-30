/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:56:52
 * Copyright © RingCentral. All rights reserved.
 */
import { INCOMING_STATE } from '../../store';

type IncomingProps = {};

type IncomingViewProps = {
  uid?: number;
  name?: string;
  phone?: string;
  isExt: boolean;
  incomingState: INCOMING_STATE;
  isMultipleCall: boolean;
};

export { IncomingProps, IncomingViewProps };
