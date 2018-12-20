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
import TaskItemModal from '@/store/models/TaskItem';
import FileItemModal from '@/store/models/FileItem';
import { Item } from 'sdk/models';
import { getFileType } from '../helper';

class TaskViewModel extends StoreViewModel<Props> implements ViewProps {
  @computed
  private get _id() {
    return this.props.ids[0];
  }

  @computed
  get task() {
    return getEntity<Item, TaskItemModal>(ENTITY_NAME.TASK_ITEM, this._id);
  }

  @computed
  get attachmentIds() {
    return this.task.attachmentIds || [];
  }

  @computed
  get files() {
    return this.attachments.map((file: FileItemModal) => {
      return getFileType(file);
    });
  }

  @computed
  get attachments() {
    return this.attachmentIds.map((attachment: number) => {
      return getEntity<Item, FileItemModal>(ENTITY_NAME.FILE_ITEM, attachment);
    });
  }
}

export { TaskViewModel };
