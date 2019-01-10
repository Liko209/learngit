/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */

import { SanitizedTaskItem } from '../entity';
import { SubItemDao } from '../../base/dao';
import { IDatabase } from 'foundation/src/db';

class TaskItemDao extends SubItemDao<SanitizedTaskItem> {
  static COLLECTION_NAME = 'taskItem';
  constructor(db: IDatabase) {
    super(TaskItemDao.COLLECTION_NAME, db);
  }
}

export { TaskItemDao };
