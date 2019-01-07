/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:59:33
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../../base/service/ISubItemService';
import { TaskItemController } from '../controller/TaskItemController';
import { Item } from '../../../entity';

class TaskItemService implements ISubItemService {
  private _taskItemController: TaskItemController;

  constructor() {}

  protected get fileItemController() {
    if (!this._taskItemController) {
      this._taskItemController = new TaskItemController();
    }
    return this._taskItemController;
  }

  updateItem(item: Item) {}

  createItem(item: Item) {}

  deleteItem(itemId: number) {}

  getSortedIds(
    groupId: number,
    limit: number,
    offset: number,
    sortKey: string,
    desc: boolean,
  ): number[] {
    return [];
  }
}

export { TaskItemService };
