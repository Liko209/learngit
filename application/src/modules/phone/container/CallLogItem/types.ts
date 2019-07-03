/*
 * @Author: isaac.liu
 * @Date: 2019-06-03 14:44:12
 * Copyright © RingCentral. All rights reserved.
 */
import { Caller } from 'sdk/module/RCItems/types';
import { RCMessage } from 'sdk/module/RCItems';

type CallLogItemProps = {
  id: string;
  didOpenMiniProfile?: Function;
};

type CallLogItemViewProps = {
  caller?: Caller;
  isUnread: boolean;
  canEditBlockNumbers: boolean;
  icon: string;
  callType: string;
  duration: string;
  startTime: string;
  isMissedCall: boolean;
  direction: RCMessage['direction'];
  shouldShowCall: () => Promise<boolean>;
} & CallLogItemProps;

export { CallLogItemProps, CallLogItemViewProps };
