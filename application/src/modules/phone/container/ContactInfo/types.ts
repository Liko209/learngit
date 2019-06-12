/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 15:45:30
 * Copyright © RingCentral. All rights reserved.
 */
import { Caller } from 'sdk/module/RCItems/types';
import { RCMessage } from 'sdk/module/RCItems';

type ContactInfoProps = {
  caller?: Caller;
  readStatus: RCMessage['readStatus'];
  didOpenMiniProfile?: Function;
  direction?: RCMessage['direction'];
  isMissedCall?: boolean;
};

type ContactInfoViewProps = {
  isExt?: boolean;
  displayName: string;
  displayNumber: string | null;
  personId?: number;
  isUnread: boolean;
  didOpenMiniProfile?: Function;
  isUnknownCaller: boolean;
};

export { ContactInfoProps, ContactInfoViewProps };
