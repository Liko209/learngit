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
import { accentColor } from '@/common/AccentColor';

class TaskItemViewModel extends AbstractViewModel<TaskProps> {
  @computed
  get _id() {
    return this.props.id;
  }

  @computed
  get task() {
    return getEntity<Item, TaskItemModel>(ENTITY_NAME.ITEM, this._id);
  }

  @computed
  get color() {
    return accentColor[this.task.color];
  }

  @computed
  get personName() {
    const { assignedToIds } = this.task;
    if (assignedToIds) {
      const personName = assignedToIds
        .map((personId: number) => {
          return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, personId)
            .userDisplayName;
        })
        .join(', ');
      return personName;
    }

    return '';
  }

  @computed
  get dueTime() {
    return this.task.due ? dateFormatter.date(this.task.due) : '';
  }
}

export { TaskItemViewModel };
