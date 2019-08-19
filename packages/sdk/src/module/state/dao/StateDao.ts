/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-08 15:55:02
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseDao } from '../../../framework/dao';
import { MyState } from '../entity';
import { IDatabase } from 'foundation/db';

class StateDao extends BaseDao<MyState> {
  static COLLECTION_NAME = 'state';
  constructor(db: IDatabase) {
    super(StateDao.COLLECTION_NAME, db);
  }

  getFirst(): Promise<MyState | null> {
    return this.createQuery().first();
  }
}

export { StateDao };
