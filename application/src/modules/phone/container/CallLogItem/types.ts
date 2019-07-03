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
  width: number;
};

type CallLogResponsiveObject = {
  ButtonToShow: number;
  ShowCallInfo: boolean;
  DateFormat: string;
};

enum BREAK_POINT_MAP {
  FULL = 832,
  EXPAND = 640,
  SHORT = 400,
}

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
  CallLogItemProps,
  CallLogItemViewProps,
  CallLogResponsiveObject,
  BREAK_POINT_MAP,
};
