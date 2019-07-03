/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-21 14:28:10
 * Copyright © RingCentral. All rights reserved.
 */

import {
  MESSAGE_STATUS,
  FAX_ERROR_CODE,
  ATTACHMENT_TYPE,
  MESSAGE_AVAILABILITY,
  CALL_DIRECTION,
  FAX_RESOLUTION,
  MESSAGE_PRIORITY,
  RC_MESSAGE_TYPE,
  READ_STATUS,
} from './constants';
import { IdModel, ModelIdType } from 'sdk/framework/model';
import { CALL_LOG_SOURCE } from './callLog/constants';
import { QUERY_DIRECTION } from 'sdk/dao';

type UriModel<T> = {
  id: T;
  uri: string;
};

type Caller = {
  phoneNumber?: string;
  extensionNumber?: string;
  location: string;
  name: string;
  device?: UriModel<string>;
  messageStatus?: MESSAGE_STATUS; // outbound fax messages
  faxErrorCode?: FAX_ERROR_CODE; // Fax
};

type CallerView = {
  phoneNumber?: string;
  extensionNumber?: string;
  name?: string;
};

type Attachment = UriModel<number> & {
  type: ATTACHMENT_TYPE;
  contentType: string;
  vmDuration?: number; // Voicemail
  filename: string;
  size: number;
};

type RCMessage = IdModel & {
  uri: string;
  attachments?: Attachment[];
  availability: MESSAGE_AVAILABILITY;
  conversationId?: number; // SMS and Pager
  conversation?: UriModel<number>; // SMS and Pager
  creationTime: string;
  deliveryErrorCode?: string; // SMS
  direction: CALL_DIRECTION;
  faxPageCount?: number; // Fax
  faxResolution?: FAX_RESOLUTION; // Fax
  from: Caller;
  lastModifiedTime: string;
  messageStatus: MESSAGE_STATUS;
  pgToDepartment?: boolean; // Pager
  priority: MESSAGE_PRIORITY;
  readStatus: READ_STATUS;
  smsDeliveryTime?: string; // SMS
  smsSendingAttemptsCount?: number; // SMS
  subject?: string;
  to: Caller;
  type: RC_MESSAGE_TYPE;
};

type FetchResult<T> = {
  data: T[];
  hasMore: boolean;
};

type FilterOptions<T> = {
  filterKey?: string;
  callLogSource?: CALL_LOG_SOURCE;
};

type FetchDataOptions<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> = {
  limit?: number;
  direction?: QUERY_DIRECTION;
  anchorId?: IdType;
  filterFunc?: (data: T) => boolean;
  callLogSource?: CALL_LOG_SOURCE;
};

export {
  UriModel,
  Caller,
  CallerView,
  RCMessage,
  FetchResult,
  Attachment,
  FilterOptions,
  FetchDataOptions,
};
