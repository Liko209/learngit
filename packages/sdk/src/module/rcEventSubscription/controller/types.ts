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

export { PubNubEventPayloadMessage };
