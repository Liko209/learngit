/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-29 10:23:56
 * Copyright © RingCentral. All rights reserved.
 */

import { Item } from '../../base/entity';

export type InteractiveMessageItemAttachmentField = {
  title: string;
  value: string;
  short: boolean;
};

export type InteractiveMessageItemAttachment = {
  author_name?: string;
  author_link?: string;
  author_icon?: string;
  footer?: string;
  footer_icon?: string;
  thumb_url?: string;
  image_url?: string;
  pretext?: string;
  title?: string;
  title_link?: string;
  attachment_type?: string;
  text?: string;
  html_text?: string;
  color?: string;
  ts?: string;
  fields?: InteractiveMessageItemAttachmentField[];
  is_truncated?: boolean;
  fallback?: string;
};

export type InteractiveMessageItem = Item & {
  user_set_title?: string;
  attachments?: InteractiveMessageItemAttachment[];
};
