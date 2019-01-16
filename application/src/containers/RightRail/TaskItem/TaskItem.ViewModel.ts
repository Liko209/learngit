/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-15 16:03:52
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { Item } from 'sdk/module/item/entity';
import TaskItemModel from '@/store/models/TaskItem';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import { dateFormatter } from '@/utils/date';
import { TaskProps } from './types';

class TaskItemViewModel extends AbstractViewModel<TaskProps> {
  @computed
  get _id() {
    return this.props.id;
  }

  @computed
  get task() {
    const task = getEntity<Item, TaskItemModel>(
      ENTITY_NAME.TASK_ITEM,
      this._id,
    );
    console.log(task, '---nello');
    return task;
  }

  @computed
  get creator() {
    const { creatorId } = this.task;
    const personName = getEntity<Person, PersonModel>(
      ENTITY_NAME.PERSON,
      creatorId,
    ).userDisplayName;
    return personName;
  }

  @computed
  get createdAt() {
    return this.task ? dateFormatter.date(this.task.createdAt) : '';
  }
}

export { TaskItemViewModel };
