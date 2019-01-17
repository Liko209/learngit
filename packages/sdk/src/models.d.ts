/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-06-06 10:17:59
 * Copyright © RingCentral. All rights reserved.
 */
import { TeamPermission } from './service/group';
import { ExtendedBaseModel } from './module/models';
import { GroupCommon } from './module/group/entity';
import { IdModel } from './framework/model';
import { State } from './module/state/entity';

export type SortableModel<T> = {
  id: number;
  displayName: string;
  firstSortKey?: any;
  secondSortKey?: any;
  entity: T;
};

export type PartialWithKey<T> = Pick<T, Extract<keyof T, 'id'>> & Partial<T>;

export type GroupApiType = ExtendedBaseModel & {
  members: (number | string)[];
} & GroupCommon;
export type UserInfo = {
  email: string;
  display_name: string;
  company_id: number;
};

export type MyState = State;

export type GroupState = {
  id: number;
  unread_count?: number;
  unread_mentions_count?: number;
  read_through?: number;
  last_read_through?: number; // last post of the group
  marked_as_unread?: boolean;
  post_cursor?: number;
  unread_deactivated_count?: number;
  group_post_cursor?: number;
  group_post_drp_cursor?: number;
  __trigger_ids?: number[];
};

export type GroupConfig = {
  id: number; // group id
  has_more_older?: boolean;
  has_more_newer?: boolean;
  is_newest_saved?: boolean;
  draft?: string;
  send_failure_post_ids?: number[];
};
