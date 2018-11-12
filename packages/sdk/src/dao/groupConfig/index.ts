/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-07 14:19:15
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseDao } from '../base';
import { GroupConfig } from '../../models';
import { IDatabase } from 'foundation';

class GroupConfigDao extends BaseDao<GroupConfig> {
  static COLLECTION_NAME = 'groupConfig';
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(GroupConfigDao.COLLECTION_NAME, db);
  }

  async hasMoreRemotePost(groupId: number): Promise<boolean> {
    const result = await this.get(groupId);
    if (result && result.has_more !== undefined) {
      return result.has_more;
    }
    return true;
  }
}

export default GroupConfigDao;
