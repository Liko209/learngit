/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-06-06 10:17:59
 * Copyright © RingCentral. All rights reserved.
 */
import { TeamPermission } from './module/group';
import { ExtendedBaseModel } from './module/models';
import { GroupCommon } from './module/group/entity';
import { IdModel } from './framework/model';

export type PartialWithKey<T> = Pick<T, Extract<keyof T, 'id'>> & Partial<T>;

export type GroupApiType = ExtendedBaseModel & {
  members: (number | string)[];
  group_id?: number;
} & GroupCommon;
export type UserInfo = {
  email: string;
  display_name: string;
  company_id: number;
};

export type GroupConfig = {
  id: number; // group id
  has_more_older?: boolean;
  has_more_newer?: boolean;
  is_newest_saved?: boolean;
  draft?: string;
  attachment_item_ids?: number[];
  send_failure_post_ids?: number[];
  last_index_of_files?: number;
  last_index_of_tasks?: number;
  last_index_of_events?: number;
  last_index_of_notes?: number;
  last_index_of_links?: number;
};
