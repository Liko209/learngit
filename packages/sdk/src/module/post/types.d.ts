/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-08 17:13:28
 * Copyright © RingCentral. All rights reserved.
 */
import { Post } from './entity/Post';
import { Raw } from '../../framework/model/Raw';
export type SendPostType = {
  text: string;
  groupId: number;
  mentionIds?: number[];
  itemIds?: number[];
  itemId?: number;
};

export type RawPostInfo = {
  userId: number;
  companyId: number;
} & SendPostType;

export type PostItemsReadyCallbackType = {
  success: boolean;
  obj: {
    item_ids?: [];
  };
};
export type PostItemsReadyCallback = (
  data: PostItemsReadyCallbackType,
) => Promise<void>;
export type SendPostItemsUpdateCallback = (
  data: Partial<Post>,
) => Promise<Post | null>;

export type EditPostType = { postId: number } & SendPostType;
