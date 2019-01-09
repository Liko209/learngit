/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-08 17:13:28
 * Copyright © RingCentral. All rights reserved.
 */
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

export type EditPostType = { postId: number } & SendPostType;
