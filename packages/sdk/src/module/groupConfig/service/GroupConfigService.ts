/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 17:23:37
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupConfig } from '../entity';
import { EntityBaseService } from '../../../framework/service';
import { daoManager, QUERY_DIRECTION } from '../../../dao';
import { GroupConfigDao } from '../dao/GroupConfigDao';
import { GroupConfigController } from '../controller/GroupConfigController';
import { Post } from 'sdk/module/post/entity';
import { mainLogger } from 'foundation/log';

const MODULE_NAME = 'GroupConfigService';
class GroupConfigService extends EntityBaseService<GroupConfig> {
  private _groupConfigController: GroupConfigController;
  constructor() {
    super({ isSupportedCache: true }, daoManager.getDao(GroupConfigDao));
  }

  // update partial groupConfig data
  async updateGroupConfigPartialData(params: GroupConfig): Promise<boolean> {
    return this.getGroupConfigController().updateGroupConfigPartialData(params);
  }

  async saveAndDoNotify(params: GroupConfig) {
    return this.getGroupConfigController().saveAndDoNotify(params);
  }

  // update partial groupConfig data, for message draft
  async updateDraft(params: {
    id: number;
    draft?: string;
    attachment_item_ids?: number[];
  }): Promise<boolean> {
    mainLogger.tags(MODULE_NAME).log('updateDraft', params);

    return this.getGroupConfigController().updateDraft(params);
  }

  async getDraft(groupId: number): Promise<string> {
    return this.getGroupConfigController().getDraft(groupId);
  }

  async getDraftAttachmentItemIds(groupId: number): Promise<number[]> {
    return this.getGroupConfigController().getDraftAttachmentItemIds(groupId);
  }

  // update partial group data, for send failure post ids
  async updateGroupSendFailurePostIds(params: {
    id: number;
    send_failure_post_ids: number[];
  }): Promise<boolean> {
    return this.getGroupConfigController().updateGroupSendFailurePostIds(
      params,
    );
  }

  // get group data, for send failure post ids
  async getGroupSendFailurePostIds(id: number): Promise<number[]> {
    return this.getGroupConfigController().getGroupSendFailurePostIds(id);
  }

  async deletePostIds(groupId: number, postIds: number[]) {
    await this.getGroupConfigController().deletePostIds(groupId, postIds);
  }

  async addPostId(groupId: number, postId: number) {
    await this.getGroupConfigController().addPostId(groupId, postId);
  }

  async handleMyMostRecentPostChange(posts: Post[]) {
    await this.getGroupConfigController().updateMyLastPostTime(posts);
  }

  async hasMorePostInRemote(groupId: number) {
    return await this.getGroupConfigController().hasMorePostInRemote(groupId);
  }

  async updateHasMore(
    groupId: number,
    direction: QUERY_DIRECTION,
    hasMore: boolean,
  ) {
    await this.getGroupConfigController().updateHasMore(
      groupId,
      direction,
      hasMore,
    );
  }

  async deleteGroupsConfig(ids: number[]) {
    await this.getGroupConfigController().deleteGroupsConfig(ids);
  }

  protected getGroupConfigController() {
    if (!this._groupConfigController) {
      this._groupConfigController = new GroupConfigController(
        this.getEntitySource(),
      );
    }
    return this._groupConfigController;
  }

  async checkIfReallyExistedDraftItems(groupId: number) {
    await this.getGroupConfigController().checkIfReallyExistedDraftItems(groupId);
  }
}

export { GroupConfigService };
