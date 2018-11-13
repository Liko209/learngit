/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-05-04 10:37:24
 * Copyright © RingCentral. All rights reserved.
 */
export type RawPostInfo = {
  atMentions?: boolean;
  users?: any[];
  text: string;
  file?: FormData;
  groupId?: number;
  itemIds?: number[];
  postId?: number;
  itemId?: number;
};

export type RawPostInfoWithFile = RawPostInfo & {
  file: FormData;
};
