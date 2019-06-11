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
import { IdModel } from 'sdk/framework/model';

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

export { UriModel, Caller, RCMessage, FetchResult, Attachment };
