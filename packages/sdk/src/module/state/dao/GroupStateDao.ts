/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-08 14:26:47
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseDao } from '../../../framework/dao';
import { GroupState } from '../entity';
import { IDatabase } from 'foundation';

class GroupStateDao extends BaseDao<GroupState> {
  static COLLECTION_NAME = 'groupState';
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

export { GroupStateDao };
