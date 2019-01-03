/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseDao } from '../../../dao';
import { IDatabase } from 'foundation/src/db';

class SubItemDao<T> extends BaseDao<T> {
  constructor(collectionName: string, db: IDatabase) {
    super(collectionName, db);
  }

  async queryItemsByGroupId(groupId: number): Promise<T[]> {
    const query = this.createQuery().contain('group_ids', groupId);
    return query.toArray();
  }
}

export { SubItemDao };
