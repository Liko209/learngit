/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-31 17:21:05
 * Copyright © RingCentral. All rights reserved.
 */

type PubNubEventPayloadMessage = {
  body: {};
  event: string;
  ownerId: string;
  subscriptionId: string;
  timestamp: string;
  uuid: string;
};

enum PNCategories {
  PNNetworkUpCategory = 'PNNetworkUpCategory',
  PNNetworkDownCategory = 'PNNetworkDownCategory',
  PNNetworkIssuesCategory = 'PNNetworkIssuesCategory',
  PNTimeoutCategory = 'PNTimeoutCategory',
  PNBadRequestCategory = 'PNBadRequestCategory',
  PNAccessDeniedCategory = 'PNAccessDeniedCategory',
  PNUnknownCategory = 'PNUnknownCategory',
  PNReconnectedCategory = 'PNReconnectedCategory',
  PNConnectedCategory = 'PNConnectedCategory',
  PNRequestMessageCountExceededCategory = 'PNRequestMessageCountExceededCategory',
}

type PubNubStatusEvent = {
  category: PNCategories; // see Categories
  operation: string; // see Operations
  affectedChannels: string[];
  subscribedChannels: string[];
  affectedChannelGroups: string[];
  lastTimetoken: number | string;
  currentTimetoken: number | string;
  error?: boolean;
  errorData?: Error;
};
export { PubNubEventPayloadMessage, PubNubStatusEvent, PNCategories };
