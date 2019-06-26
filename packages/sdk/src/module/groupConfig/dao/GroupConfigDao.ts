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

  async hasMoreRemotePost(groupId: number) {
    const result = await this.get(groupId);
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

  async isNewestSaved(groupId: number): Promise<boolean> {
    const result = await this.get(groupId);
    return !!(result && result.is_newest_saved);
  }
}

export { GroupConfigDao };
