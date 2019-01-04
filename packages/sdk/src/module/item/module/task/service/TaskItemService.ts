/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:59:33
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../../base/service/ISubItemService';
import { TaskItemController } from '../controller/TaskItemController';
import { EntityBaseService } from '../../../../../framework/service';

class TaskItemService extends EntityBaseService implements ISubItemService {
  private _taskItemController: TaskItemController;

  constructor() {
    super();
  }

  protected get fileItemController() {
    if (!this._taskItemController) {
      this._taskItemController = new TaskItemController();
    }
    return this._taskItemController;
  }

  getSortedIds(
    groupId: number,
    limit: number,
    offset: number,
    sortKey: string,
    desc: boolean,
  ): number[] {
    return [];
  }

  updateItem(): void {}
}

export { TaskItemService };
