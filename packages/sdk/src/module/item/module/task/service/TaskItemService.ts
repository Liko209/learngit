/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:59:33
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../../base/service/ISubItemService';
import { TaskItemController } from '../controller/TaskItemController';
import { EntityBaseService } from '../../../../../framework/service';
import { IItemService } from '../../../service/IItemService';
import { ItemQueryOptions, ItemFilterFunction } from '../../../types';
import { TaskItem, SanitizedTaskItem } from '../entity';
import { TaskItemDao } from '../dao';
import { daoManager } from '../../../../../dao';
import { ItemUtils } from '../../../utils';

class TaskItemService extends EntityBaseService implements ISubItemService {
  private _taskItemController: TaskItemController;

  constructor(itemService: IItemService) {
    super();
  }

  protected get taskItemController() {
    if (!this._taskItemController) {
      this._taskItemController = new TaskItemController();
    }
    return this._taskItemController;
  }

  async updateItem(task: TaskItem) {
    const sanitizedDao = daoManager.getDao<TaskItemDao>(TaskItemDao);
    await sanitizedDao.update(this._toSanitizedTask(task));
  }

  async deleteItem(itemId: number) {
    const sanitizedDao = daoManager.getDao<TaskItemDao>(TaskItemDao);
    await sanitizedDao.delete(itemId);
  }

  async createItem(task: TaskItem) {
    const sanitizedDao = daoManager.getDao<TaskItemDao>(TaskItemDao);
    await sanitizedDao.put(this._toSanitizedTask(task));
  }

  private _toSanitizedTask(task: TaskItem) {
    return {
      ...ItemUtils.toSanitizedItem(task),
      due: task.due || undefined,
      assigned_to_ids: task.assigned_to_ids,
      section: task.section,
      color: task.color,
    } as SanitizedTaskItem;
  }

  async getSortedIds(options: ItemQueryOptions): Promise<number[]> {
    const sanitizedDao = daoManager.getDao<TaskItemDao>(TaskItemDao);
    return await sanitizedDao.getSortedIds(options);
  }

  async getSubItemsCount(groupId: number, filterFunc?: ItemFilterFunction) {
    const sanitizedDao = daoManager.getDao<TaskItemDao>(TaskItemDao);
    return await sanitizedDao.getGroupItemCount(groupId, filterFunc);
  }
}

export { TaskItemService };
