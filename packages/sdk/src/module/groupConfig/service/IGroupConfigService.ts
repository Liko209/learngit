/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-01 16:36:26
 * Copyright © RingCentral. All rights reserved.
 */
import { GroupConfig } from '../entity';
import { Post } from 'sdk/module/post/entity';
import { QUERY_DIRECTION } from 'sdk/dao';

interface IGroupConfigService {
  updateGroupConfigPartialData(params: GroupConfig): Promise<boolean>;
  saveAndDoNotify(params: GroupConfig): Promise<boolean>;
  updateDraft(params: {
    id: number;
    draft?: string;
    attachment_item_ids?: number[];
  }): Promise<boolean>;

  getDraft(groupId: number): Promise<string>;

  getDraftAttachmentItemIds(groupId: number): Promise<number[]>;

  // update partial group data, for send failure post ids
  updateGroupSendFailurePostIds(params: {
    id: number;
    send_failure_post_ids: number[];
  }): Promise<boolean>;

  // get group data, for send failure post ids
  getGroupSendFailurePostIds(id: number): Promise<number[]>;

  deletePostIds(groupId: number, postIds: number[]): Promise<void>;

  addPostId(groupId: number, postId: number): Promise<void>;

  handleMyMostRecentPostChange(posts: Post[]): Promise<void>;

  hasMorePostInRemote(
    groupId: number,
  ): Promise<{ older: boolean; newer: boolean; both: boolean }>;

  updateHasMore(
    groupId: number,
    direction: QUERY_DIRECTION,
    hasMore: boolean,
  ): Promise<void>;

  deleteGroupsConfig(ids: number[]): Promise<void>;

  clearDraftFlagIfNotReallyExisted(groupId: number): Promise<void>;
}

export { IGroupConfigService };
