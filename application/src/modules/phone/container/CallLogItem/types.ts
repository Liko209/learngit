/*
 * @Author: isaac.liu
 * @Date: 2019-06-03 14:44:12
 * Copyright © RingCentral. All rights reserved.
 */
import { Caller } from 'sdk/module/RCItems/types';
import { RCMessage } from 'sdk/module/RCItems';
import { Checker } from '../../types';
import { CommonResponsiveObject } from '../VoicemailItem/types';

type CallLogItemProps = {
  id: string;
  didOpenMiniProfile?: Function;
  width: number;
};

type CallLogResponsiveObject = CommonResponsiveObject & {
  showCallInfo: boolean;
};

type Handler = {
  checker: Checker;
  info: CallLogResponsiveObject;
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
  callLogResponsiveMap: CallLogResponsiveObject;
  shouldShowCall: () => Promise<boolean>;
} & CallLogItemProps;

export {
  Checker,
  Handler,
  CallLogItemProps,
  CallLogItemViewProps,
  CallLogResponsiveObject,
};
