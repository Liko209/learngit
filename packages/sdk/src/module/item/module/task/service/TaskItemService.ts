/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:59:33
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../../base/service/ISubItemService';
import { TaskItemController } from '../controller/TaskItemController';

class TaskItemService extends ISubItemService {
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
}

export { TaskItemService };
