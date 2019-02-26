/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { SanitizedTaskItem, TaskItem } from '../entity';
import { SubItemDao } from '../../base/dao';
import { IDatabase } from 'foundation/src/db';

class TaskItemDao extends SubItemDao<SanitizedTaskItem> {
  static COLLECTION_NAME = 'taskItem';
  constructor(db: IDatabase) {
    super(TaskItemDao.COLLECTION_NAME, db);
  }

  toSanitizedItem(task: TaskItem) {
    return {
      ...super.toSanitizedItem(task),
      complete: task.complete,
      due: task.due,
      assigned_to_ids: task.assigned_to_ids,
      color: task.color,
    } as SanitizedTaskItem;
  }

  toPartialSanitizedItem(partialItem: Partial<TaskItem>) {
    return {
      ...super.toPartialSanitizedItem(partialItem),
      ..._.pick(partialItem, ['complete', 'due', 'assigned_to_ids', 'color']),
    };
  }
}

export { TaskItemDao };
