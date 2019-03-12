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
import { accentColor } from '@/common/AccentColor';

class TaskViewModel extends StoreViewModel<Props> implements ViewProps {
  @computed
  private get _id() {
    return this.props.ids[0];
  }

  @computed
  get task() {
    return getEntity<Item, TaskItemModel>(ENTITY_NAME.ITEM, this._id);
  }

  truncateNotesOrSection = (text: string, subLength: number) => {
    if (text.length > subLength) {
      return `${text.substr(0, subLength)}...`;
    }
    return text;
  }

  @computed
  get notes() {
    const { notes } = this.task;

    return notes ? this.truncateNotesOrSection(notes, 300) : '';
  }

  @computed
  get section() {
    const { section } = this.task;

    return section ? this.truncateNotesOrSection(section, 300) : '';
  }

  @computed
  get color() {
    return accentColor[this.task.color];
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
    const items: FileItemModel[] = [];
    this.attachmentIds.forEach((attachment: number) => {
      const item = getEntity<Item, FileItemModel>(ENTITY_NAME.ITEM, attachment);
      if (item && !item.deactivated) {
        items.push(item);
      }
    });
    return items;
  }
}

export { TaskViewModel };
