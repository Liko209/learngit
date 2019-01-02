/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */

import { SanitizedTaskItem } from '../entity';
import { BaseDao } from '../../../dao';
import { IDatabase } from 'foundation/src/db';

class TaskItemDao extends BaseDao<SanitizedTaskItem> {
  static COLLECTION_NAME = 'taskItem';
  constructor(db: IDatabase) {
    super(TaskItemDao.COLLECTION_NAME, db);
  }
}

export { TaskItemDao };
