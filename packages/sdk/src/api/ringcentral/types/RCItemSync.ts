/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-15 15:56:05
 * Copyright © RingCentral. All rights reserved.
 */

import { CALL_LOG_SOURCE } from 'sdk/module/RCItems/callLog/constants';
import { CALL_DIRECTION, RC_MESSAGE_TYPE } from 'sdk/module/RCItems/constants';
import { SYNC_TYPE } from 'sdk/module/RCItems/sync/constants';

type RCItemSyncInfo = {
  syncType: SYNC_TYPE;
  syncToken: string;
  syncTime: string;
};

type RCItemSyncResponse<T> = {
  records: T[];
  syncInfo: RCItemSyncInfo;
};

type CallLogSyncParams = {
  syncType: SYNC_TYPE;
  syncToken?: string;
  recordCount?: number;
  statusGroup?: CALL_LOG_SOURCE;
  showDeleted?: boolean;
};

type RCMessageSyncParams = {
  conversationId?: number;
  direction?: CALL_DIRECTION;
  messageType?: RC_MESSAGE_TYPE;
  recordCount?: number;
  syncToken?: string;
  syncType: SYNC_TYPE;
};

type RCMessageClearAllParams = {
  conversationId?: number[];
  dateTo?: string;
  type: RC_MESSAGE_TYPE;
};

type CallLogClearAllParams = {
  dateTo: string;
};

export {
  RCItemSyncInfo,
  RCItemSyncResponse,
  CallLogSyncParams,
  RCMessageSyncParams,
  RCMessageClearAllParams,
  CallLogClearAllParams,
};
