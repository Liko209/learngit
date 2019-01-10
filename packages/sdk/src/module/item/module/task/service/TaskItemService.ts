/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:59:33
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../../base/service/ISubItemService';
import { TaskItemController } from '../controller/TaskItemController';
import { Item } from '../../../entity';
import { EntityBaseService } from '../../../../../framework/service';
import { IItemService } from '../../../service/IItemService';

class TaskItemService extends EntityBaseService implements ISubItemService {
  private _taskItemController: TaskItemController;

  constructor(itemService: IItemService) {
    super();
  }

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
    offsetItemId: number | undefined,
    sortKey: string,
    desc: boolean,
  ): Promise<number[]> {
    return Promise.resolve([]);
  }

  async getSubItemsCount(groupId: number) {
    return 0;
  }
}

export { TaskItemService };
