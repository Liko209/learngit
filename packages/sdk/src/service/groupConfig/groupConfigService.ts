/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-25 11:12:46
 * Copyright © RingCentral. All rights reserved.
 */
import { GroupConfig } from '../../models';
import BaseService from '../../service/BaseService';
class GroupConfigService extends BaseService<GroupConfig> {
  async getById(id: number): Promise<GroupConfig> {
    const result = await this.getByIdFromDao(id); // groupId
    return result;
  }
  // update partial group data, for message draft
  // async updateGroupDraft(params: {
  //   id: number;
  //   draft: string;
  // }): Promise<boolean> {
  //   const result = await this.updateGroupPartialData({
  //     id: params.id,
  //     __draft: params.draft,
  //   });
  //   return result;
  // }
}

export { GroupConfigService };
