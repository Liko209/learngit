/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 13:15:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ExtendedBaseModel } from '../../models';
import { PostItemData } from './PostItemData';
import { IdModel, Raw } from '../../../framework/model';
import { Item } from '../../item/entity';
import { QUERY_DIRECTION } from '../../../dao/constants';

export type Post = ExtendedBaseModel & {
  group_id: number;
  company_id: number;
  text: string;
  item_id?: number;
  item_ids: number[];
  post_ids: number[]; // quoted posts
  likes?: number[];
  activity?: string;
  activity_data?: { [key: string]: string };
  at_mention_item_ids?: number[];
  at_mention_non_item_ids?: number[];
  new_version?: number; // This field should be moved to base model?
  from_company_id?: number;
  from_group_id?: number;
  item_data?: PostItemData;
  links?: object[];
  items?: object[];
  source?: string;
  parent_id?: number;
  unique_id: string;
  annotation?: {
    x_percent: number;
    y_percent: number;
    stored_file_version: number;
    anno_id?: string;
    page?: number; // page and anno_id is for document only
  };
  icon?: string; // for integration
  is_team_mention?: boolean;
  is_admin_mention?: boolean;
};

export type PostView = IdModel & {
  group_id: number;
  created_at: number;
};

export type IPostQuery = {
  groupId: number;
  limit?: number;
  postId?: number;
  direction?: QUERY_DIRECTION;
};

export type UnreadPostQuery = {
  groupId: number;
  startPostId: number;
  endPostId: number;
  unreadCount: number;
};

export type IPostResultHasMore = {
  older: boolean;
  newer: boolean;
  both: boolean;
};

export type IPostResult = {
  posts: Post[];
  items: Item[];
  hasMore: IPostResultHasMore;
  limit?: number;
};

export type IPostsModel = {
  posts: Raw<Post>[];
  items: Raw<Item>[];
};

export type IRawPostResult = {
  posts: Raw<Post>[];
  items: Raw<Item>[];
  hasMore: boolean;
};

export type IRemotePostRequest = {
  direction: QUERY_DIRECTION;
  groupId: number;
  limit: number;
  postId: number;
  shouldSaveToDb: boolean;
};
