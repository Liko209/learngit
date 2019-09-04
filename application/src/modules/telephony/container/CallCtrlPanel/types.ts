/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-25 16:49:42
 * Copyright © RingCentral. All rights reserved.
 */
import { CALL_DIRECTION } from 'sdk/module/RCItems';

type CallCtrlPanelProps = {};

type CallCtrlPanelViewProps = {
  isExt: boolean;
  name?: string;
  phone?: string;
  uid?: number;
  direction?: CALL_DIRECTION;
  isWarmTransferPage: boolean;
  isConference: boolean;
};

export { CallCtrlPanelProps, CallCtrlPanelViewProps };
