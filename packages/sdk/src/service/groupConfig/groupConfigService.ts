/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-25 11:12:46
 * Copyright © RingCentral. All rights reserved.
 */
import { GroupConfig, GroupDraftModel } from '../../models';
import BaseService from '../../service/BaseService';
import { ErrorParserHolder } from '../../error';
import { daoManager, GroupConfigDao } from '../../dao';
import notificationCenter from '../notificationCenter';
import { ENTITY } from '../eventKey';
class GroupConfigService extends BaseService<GroupConfig> {
  static serviceName = 'GroupConfigService';

  constructor() {
    super(GroupConfigDao, null, null, {});
  }

  async getById(id: number): Promise<GroupConfig | null> {
    const dao = daoManager.getDao(GroupConfigDao);
    return await dao.get(id);
  }

  // update partial groupConfig data
  async updateGroupConfigPartialData(params: object): Promise<boolean> {
    try {
      await this.handlePartialUpdate(
        params,
        undefined,
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
    const groupConfigDao = daoManager.getDao(GroupConfigDao);
    const original = await groupConfigDao.get(params.id);
    // this is because of updateGroupConfigPartialData won't support a model to to parital update if it does exist
    if (original) {
      return this.updateGroupConfigPartialData(params);
    }
    groupConfigDao.update(params);
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
    draft: GroupDraftModel;
  }): Promise<boolean> {
    return this.saveAndDoNotify(params);
  }

  async getDraft(groupId: number): Promise<GroupDraftModel | undefined> {
    const groupConfigDao = daoManager.getDao(GroupConfigDao);
    const config: GroupConfig | null = groupId
      ? await groupConfigDao.get(groupId)
      : null;
    if (config && config.draft) {
      return config.draft;
    }
    return undefined;
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
      const group = (await this.getById(id)) as GroupConfig;
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
}

export { GroupConfigService };
