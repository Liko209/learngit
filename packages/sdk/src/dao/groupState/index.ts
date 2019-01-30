/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-04-08 14:50:38
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseDao } from '../../framework/dao';
import { GroupState } from '../../models';
import { IDatabase } from 'foundation';

class GroupStateDao extends BaseDao<GroupState> {
  static COLLECTION_NAME = 'groupState';
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(GroupStateDao.COLLECTION_NAME, db);
  }

  getAll(): Promise<GroupState[]> {
    return this.createQuery().toArray();
  }
  getByIds(ids: number[]) {
    return this.createQuery()
      .anyOf('id', ids)
      .toArray();
  }
}

export default GroupStateDao;
