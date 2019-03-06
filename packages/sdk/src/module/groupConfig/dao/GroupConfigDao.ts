/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-07 14:19:15
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseDao } from '../../../framework/dao';
import { GroupConfig } from '../entity';
import { IDatabase } from 'foundation';
import { QUERY_DIRECTION } from '../../../dao/constants';

class GroupConfigDao extends BaseDao<GroupConfig> {
  static COLLECTION_NAME = 'groupConfig';
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(GroupConfigDao.COLLECTION_NAME, db);
  }

  async hasMoreRemotePost(
    groupId: number,
    direction: QUERY_DIRECTION,
  ): Promise<boolean> {
    const result = await this.get(groupId);
    if (result && result[`has_more_${direction}`] !== undefined) {
      return result[`has_more_${direction}`];
    }
    return true;
  }

  async isNewestSaved(groupId: number): Promise<boolean> {
    const result = await this.get(groupId);
    return !!(result && result.is_newest_saved);
  }
}

export { GroupConfigDao };
