/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 13:15:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ExtendedBaseModel } from '../../models';
import { PostItemData } from './PostItemData';
import { IdModel } from '../../../framework/model';

export type Post = ExtendedBaseModel & {
  group_id: number;
  company_id: number;
  text: string;
  item_id?: number;
  item_ids: number[];
  post_ids: number[]; // quoted posts
  likes?: number[];
  activity?: string;
  activity_data?: object;
  at_mention_item_ids?: number[];
  at_mention_non_item_ids?: number[];
  new_version?: number; // This field should be moved to base model?
  from_group_id?: number;
  item_data?: PostItemData;
  links?: object[];
  items?: object[];
  source?: string;
  parent_id?: number;
};

export type PostView = IdModel & {
  group_id: number;
  created_at: number;
};
