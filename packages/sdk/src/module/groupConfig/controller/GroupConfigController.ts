/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 17:22:48
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { GroupConfig } from '../entity';
import { ErrorParserHolder } from '../../../error';
import notificationCenter from '../../../service/notificationCenter';
import { ENTITY } from '../../../service/eventKey';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { buildPartialModifyController } from '../../../framework/controller';
import { mainLogger } from 'foundation/log';
import { Post } from 'sdk/module/post/entity';
import { QUERY_DIRECTION } from 'sdk/dao/constants';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { ItemService } from 'sdk/module/item';

const LOG_TAG = 'GroupConfigController';
class GroupConfigController {
  static serviceName = 'GroupConfigService';
  private queue = Promise.resolve();

  constructor(
    public entitySourceController: IEntitySourceController<GroupConfig>,
  ) { }

  async updateGroupConfigPartialData(params: GroupConfig): Promise<boolean> {
    try {
      const partialModifyController = buildPartialModifyController<GroupConfig>(
        this.entitySourceController,
      );
      await partialModifyController.updatePartially({
        entityId: params.id,
        preHandlePartialEntity: () => params,
        doUpdateEntity: async (updatedModel: GroupConfig) => updatedModel,
      });
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

    await this.entitySourceController.update(params);
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
    return await this.saveAndDoNotify(params);
  }

  // get group data, for send failure post ids
  async getGroupSendFailurePostIds(id: number): Promise<number[]> {
    try {
      const group = (await this.entitySourceController.get(id)) as GroupConfig;
      if (group && group.send_failure_post_ids) {
        return _.cloneDeep(group.send_failure_post_ids);
      }
      return [];
    } catch (error) {
      throw ErrorParserHolder.getErrorParser().parse(error);
    }
  }

  async deletePostIds(groupId: number, postIds: number[]) {
    this.queue = this.queue.then(async () => {
      const failIds = await this.getGroupSendFailurePostIds(groupId);
      if (failIds.length && postIds.length) {
        const resultIds: number[] = _.difference(failIds, postIds);
        if (resultIds.toString() !== failIds.toString()) {
          await this.updateGroupSendFailurePostIds({
            id: groupId,
            send_failure_post_ids: resultIds,
          });
        }
      }
    });
    return this.queue;
  }

  async addPostId(groupId: number, postId: number) {
    const failIds = await this.getGroupSendFailurePostIds(groupId);
    const newIds = [...new Set([...failIds, postId])];
    await this.updateGroupSendFailurePostIds({
      id: groupId,
      send_failure_post_ids: newIds,
    });
  }

  async updateMyLastPostTime(posts: Post[]) {
    try {
      const partialConfigs = [];
      const groupConfigs = await Promise.all(
        posts.map(post => this.entitySourceController.get(post.group_id)),
      );

      for (const post of posts) {
        const groupConfig = groupConfigs.find(x =>
          x ? x.id === post.group_id : false,
        );
        const lastPostTime =
          (groupConfig && groupConfig.my_last_post_time) || 0;
        if (post.created_at > lastPostTime) {
          partialConfigs.push({
            id: post.group_id,
            my_last_post_time: post.created_at,
          });
        }
      }

      partialConfigs.length &&
        (await this.entitySourceController.bulkUpdate(partialConfigs));
    } catch (error) {
      mainLogger.tags(LOG_TAG).log('recordMyLastPostTime failed', error);
    }
  }

  async hasMorePostInRemote(groupId: number) {
    const result = await this.entitySourceController.getEntityLocally(groupId);
    let older = true;
    let newer = true;
    let both = true;
    if (result) {
      older =
        result.has_more_older !== undefined ? result.has_more_older : true;
      newer =
        result.has_more_newer !== undefined ? result.has_more_newer : true;
      both = older && older;
    }
    return {
      older,
      newer,
      both,
    };
  }

  async updateHasMore(
    groupId: number,
    direction: QUERY_DIRECTION,
    hasMore: boolean,
  ) {
    this.saveAndDoNotify({
      id: groupId,
      [`has_more_${direction}`]: hasMore,
    });
  }

  async deleteGroupsConfig(ids: number[]) {
    this.entitySourceController.bulkDelete(ids);
  }

  async clearDraftFlagIfNotReallyExisted(groupId: number) {
    const result = await this.entitySourceController.getEntityLocally(groupId);
    if (result) {
      const { attachment_item_ids = [] } = result;
      if (attachment_item_ids.length) {
        try {
          const items = await ServiceLoader.getInstance<ItemService>(
            ServiceConfig.ITEM_SERVICE,
          ).getEntitySource().getEntitiesLocally(attachment_item_ids, true);
          const ids = items.map(item => item.id);
          const errorIds = _.difference(attachment_item_ids, ids);
          if (errorIds.length) {
            await this.updateDraft({
              id: groupId,
              attachment_item_ids: _.intersection(ids, attachment_item_ids)
            });
            mainLogger.warn(`checkIfReallyExistedDraft hit a bug, gid:${groupId}, attachment_item_ids${attachment_item_ids}, errorIds:${errorIds}`)
          }
        } catch (e) {
          mainLogger.error('checkIfReallyExistedDraft error', e);
        }
      }
    }
  }
}

export { GroupConfigController };
