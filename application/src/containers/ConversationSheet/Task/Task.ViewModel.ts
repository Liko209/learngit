/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:18:07
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import TaskItemModel from '@/store/models/TaskItem';
import FileItemModel from '@/store/models/FileItem';
import { recentlyTwoDayAndOther } from '@/utils/date';
import { Item } from 'sdk/module/item/entity';
import { getFileType } from '@/common/getFileType';
import { getDateAndTime } from '../helper';

class TaskViewModel extends StoreViewModel<Props> implements ViewProps {
  @computed
  private get _id() {
    return this.props.ids[0];
  }

  @computed
  get task() {
    return getEntity<Item, TaskItemModel>(ENTITY_NAME.TASK_ITEM, this._id);
  }

  @computed
  get hasTime() {
    const { start, due } = this.task;
    return !!(start && due);
  }

  @computed
  get startTime() {
    const startTime = this.task.start;
    return startTime ? recentlyTwoDayAndOther(startTime) : '';
  }

  @computed
  get endTime() {
    const endTime = this.task.due;
    return endTime ? getDateAndTime(endTime) : '';
  }

  @computed
  get attachmentIds() {
    return this.task.attachmentIds || [];
  }

  @computed
  get files() {
    return this.attachments.map((file: FileItemModel) => {
      return getFileType(file);
    });
  }

  @computed
  get attachments() {
    return this.attachmentIds.map((attachment: number) => {
      return getEntity<Item, FileItemModel>(ENTITY_NAME.FILE_ITEM, attachment);
    });
  }
}

export { TaskViewModel };
