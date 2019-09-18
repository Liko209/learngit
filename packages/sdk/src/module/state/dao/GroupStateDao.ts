/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-08 14:26:47
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseDao } from '../../../framework/dao';
import { GroupState } from '../entity';
import { IDatabase } from 'foundation/db';

class GroupStateDao extends BaseDao<GroupState> {
  static COLLECTION_NAME = 'groupState';
  constructor(db: IDatabase) {
    super(GroupStateDao.COLLECTION_NAME, db);
  }

  getAll(): Promise<GroupState[]> {
    return this.createQuery().toArray();
  }
}

export { GroupStateDao };
