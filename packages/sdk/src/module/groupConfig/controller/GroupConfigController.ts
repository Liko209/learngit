/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 17:22:48
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupConfig } from '../entity';
import { ErrorParserHolder } from '../../../error';
import notificationCenter from '../../../service/notificationCenter';
import { ENTITY } from '../../../service/eventKey';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { buildPartialModifyController } from '../../../framework/controller';
import { Raw } from '../../../framework/model';
import { mainLogger } from 'foundation';
import { Post } from 'sdk/module/post/entity';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';

const LOG_TAG = 'GroupConfigController';
class GroupConfigController {
  static serviceName = 'GroupConfigService';

  constructor(
    public entitySourceController: IEntitySourceController<GroupConfig>,
  ) {}

  async updateGroupConfigPartialData(params: GroupConfig): Promise<boolean> {
    try {
      const partialModifyController = buildPartialModifyController<GroupConfig>(
        this.entitySourceController,
      );
      await partialModifyController.updatePartially(
        params.id,
        (
          partialModel: Partial<Raw<GroupConfig>>,
          originalModel: GroupConfig,
        ) => {
          return params;
        },
        async (updatedModel: GroupConfig) => {
          return updatedModel;
        },
      );
      return true;
    } catch (error) {
      throw ErrorParserHolder.getErrorParser().parse(error);
    }
  }
  async saveAndDoNotify(params: GroupConfig) {
    const original = await this.entitySourceController.get(params.id);
    // this is because of updateGroupConfigPartialData won't support a model to to parital update if it does exist
    if (original) {
      return this.updateGroupConfigPartialData(params);
    }

    this.entitySourceController.update(params);
    notificationCenter.emitEntityUpdate(
      ENTITY.GROUP_CONFIG,
      [params],
      [params],
    );
    return true;
  }
  // update partial groupConfig data, for message draft
  async updateDraft(params: {
    id: number;
    draft?: string;
    attachment_item_ids?: number[];
  }): Promise<boolean> {
    return this.saveAndDoNotify(params);
  }

  async getDraft(groupId: number): Promise<string> {
    const config: GroupConfig | null = groupId
      ? await this.entitySourceController.get(groupId)
      : null;
    if (config && config.draft) {
      return config.draft;
    }
    return '';
  }

  async getDraftAttachmentItemIds(groupId: number): Promise<number[]> {
    const config: GroupConfig | null = groupId
      ? await this.entitySourceController.get(groupId)
      : null;
    if (config && config.attachment_item_ids) {
      return config.attachment_item_ids;
    }
    return [];
  }

  // update partial group data, for send failure post ids
  async updateGroupSendFailurePostIds(params: {
    id: number;
    send_failure_post_ids: number[];
  }): Promise<boolean> {
    return this.saveAndDoNotify(params);
  }

  // get group data, for send failure post ids
  async getGroupSendFailurePostIds(id: number): Promise<number[]> {
    try {
      const group = (await this.entitySourceController.get(id)) as GroupConfig;
      return (group && group.send_failure_post_ids) || [];
    } catch (error) {
      throw ErrorParserHolder.getErrorParser().parse(error);
    }
  }

  async deletePostId(groupId: number, postId: number) {
    const failIds = await this.getGroupSendFailurePostIds(groupId);
    const index = failIds.indexOf(postId);
    if (index > -1) {
      failIds.splice(index, 1);
      await this.updateGroupSendFailurePostIds({
        id: groupId,
        send_failure_post_ids: failIds,
      });
    }
  }

  async addPostId(groupId: number, postId: number) {
    const failIds = await this.getGroupSendFailurePostIds(groupId);
    const newIds = [...new Set([...failIds, postId])];
    await this.updateGroupSendFailurePostIds({
      id: groupId,
      send_failure_post_ids: newIds,
    });
  }

  private async _recordMyLastPostTime(groupId: number, timeStamp: number) {
    const updateData = {
      id: groupId,
      my_last_post_time: timeStamp,
    };
    try {
      await this.entitySourceController.update(updateData);
    } catch (error) {
      mainLogger.tags(LOG_TAG).log('recordMyLastPostTime failed', updateData);
    }
  }

  private _getCurrentUserId() {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    return userConfig.getGlipUserId();
  }

  async updateMyLastPostTime(groupId: number, post: Post) {
    if (post.creator_id !== this._getCurrentUserId()) {
      return;
    }

    const groupConfig = await this.entitySourceController.get(groupId);
    const lastPostTime = (groupConfig && groupConfig.my_last_post_time) || 0;
    if (post.created_at > lastPostTime) {
      await this._recordMyLastPostTime(groupId, post.created_at);
    }
  }
}

export { GroupConfigController };
