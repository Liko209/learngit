/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-25 11:12:46
 * Copyright © RingCentral. All rights reserved.
 */
import { GroupConfig } from '../../models';
import BaseService from '../../service/BaseService';
import { ErrorParser } from '../../utils/error';
import { daoManager, GroupConfigDao } from '../../dao';
class GroupConfigService extends BaseService<GroupConfig> {
  static serviceName = 'GroupConfigService';

  constructor() {
    super(GroupConfigDao, null, null, {});
  }

  async getById(id: number): Promise<GroupConfig> {
    const result = await this.getByIdFromDao(id); // groupId
    return result;
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
      throw ErrorParser.parse(error);
    }
  }
  // update partial groupConfig data, for message draft
  async updateDraft(params: { id: number; draft: string }): Promise<boolean> {
    return this.updateGroupConfigPartialData({
      id: params.id,
      draft: params.draft,
    });
  }

  async getDraft(groupId: number): Promise<string> {
    const groupConfigDao = daoManager.getDao(GroupConfigDao);
    const config: GroupConfig | null = groupId
      ? await groupConfigDao.get(groupId)
      : null;
    if (config && config.draft) {
      return config.draft;
    }
    return '';
  }
}

export { GroupConfigService };
