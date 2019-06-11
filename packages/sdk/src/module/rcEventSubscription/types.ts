/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-06-04 19:34:42
 * Copyright © RingCentral. All rights reserved.
 */

import { CALL_DIRECTION } from '../RCItems';
import { TELEPHONY_STATUS } from './constants';

type MissedCallEventPayload = {
  sid: string;
  srvLvl: string;
  srvLvlExt: string;
  sessionId: string;
  fromName: string;
  toName: string;
  toUrl: string;
  action: string;
  uuid: string;
  timestamp: string;
  to: string;
  event: string;
  subscriptionId: string;
  extensionId: number;
  serverId: string;
  from: string;
  ownerId: string;
};

type ActiveCall = {
  id: string;
  direction: CALL_DIRECTION;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  telephonyStatus: TELEPHONY_STATUS;
  sessionId: string;
  startTime: string;
  terminationType: string;
  onBehalfOf: string;
  partyId: string;
  telephonySessionId: string;
};

type RCPresenceEventPayload = {
  uri: string;
  allowSeeMyPresence: boolean;
  dndStatus: string;
  pickUpCallsOnHold: boolean;
  presenceStatus: string;
  ringOnMonitoredCall: boolean;
  telephonyStatus: TELEPHONY_STATUS;
  userStatus: string;
  activeCalls: ActiveCall[];
  extensionId: number;
  sequence: number;
  totalActiveCalls: number;
  meetingStatus: string;
};

export { MissedCallEventPayload, RCPresenceEventPayload, ActiveCall };
