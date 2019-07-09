/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:59:33
 * Copyright © RingCentral. All rights reserved.
 */

import { TaskItemController } from '../controller/TaskItemController';
import { TaskItem, SanitizedTaskItem } from '../entity';
import { BaseSubItemService } from '../../base/service/BaseSubItemService';
import { TaskItemDao } from '../dao/TaskItemDao';
import { daoManager } from '../../../../../dao';
import { GlipTypeUtil, TypeDictionary } from '../../../../../utils';

class TaskItemService extends BaseSubItemService<TaskItem, SanitizedTaskItem> {
  private _taskItemController: TaskItemController;

  constructor() {
    super(daoManager.getDao<TaskItemDao>(TaskItemDao));
    this.setCheckTypeFunc((id: number) => GlipTypeUtil.isExpectedType(id, TypeDictionary.TYPE_ID_TASK));
  }

  protected get taskItemController() {
    if (!this._taskItemController) {
      this._taskItemController = new TaskItemController();
    }
    return this._taskItemController;
  }
}

export { TaskItemService };
