/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 17:23:37
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupConfig } from '../entity';
import { EntityBaseService } from '../../../framework/service';
import { daoManager } from '../../../dao';
import { GroupConfigDao } from '../dao/GroupConfigDao';
import { GroupConfigController } from '../controller/GroupConfigController';
import { Post } from 'sdk/module/post/entity';
import { mainLogger } from 'foundation';

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

  protected getGroupConfigController() {
    if (!this._groupConfigController) {
      this._groupConfigController = new GroupConfigController(
        this.getEntitySource(),
      );
    }
    return this._groupConfigController;
  }
}

export { GroupConfigService };
