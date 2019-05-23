/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:18:07
 * Copyright © RingCentral. All rights reserved.
 */
import { promisedComputed } from 'computed-async-mobx';
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
import { getDateAndTime, getDurationTimeText } from '../helper';
import { accentColor } from '@/common/AccentColor';
import { Post } from 'sdk/module/post/entity';
import PostModel from '@/store/models/Post';
import { PermissionService, UserPermissionType } from 'sdk/module/permission';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';

class TaskViewModel extends StoreViewModel<Props> implements ViewProps {
  private static _isCollapseMap = new Map<number, boolean>();
  initialExpansionStatus = TaskViewModel._isCollapseMap.get(this._postId);

  @computed
  private get _id() {
    return this.props.ids[0];
  }

  @computed
  get _postId() {
    return this.props.postId;
  }

  @computed
  get post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this._postId);
  }

  @computed
  get task() {
    return getEntity<Item, TaskItemModel>(ENTITY_NAME.ITEM, this._id);
  }

  switchExpandHandler = (collapsed: boolean) => {
    TaskViewModel._isCollapseMap.set(this._postId, collapsed);
  }

  @computed
  get effectiveIds() {
    const { assignedToIds } = this.task;
    if (!assignedToIds) {
      return [];
    }

    return assignedToIds
      .map((assignedId: number) => {
        const person = getEntity<Person, PersonModel>(
          ENTITY_NAME.PERSON,
          assignedId,
        );
        if (person.isMocked) {
          return null;
        }
        return assignedId;
      })
      .filter((item) => item !== null);
  }

  @computed
  get groupId() {
    return this.post && this.post.groupId;
  }

  getShowDialogPermission = async () => {
    const permissionService = ServiceLoader.getInstance<PermissionService>(
      ServiceConfig.PERMISSION_SERVICE,
    );
    return await permissionService.hasPermission(
      UserPermissionType.JUPITER_CAN_SHOW_IMAGE_DIALOG,
    );
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

  startTime = promisedComputed('', async () => {
    const startTime = this.task.start;
    return startTime ? await recentlyTwoDayAndOther(startTime) : '';
  });

  endTime = promisedComputed('', async () => {
    const endTime = this.task.due;
    return endTime ? await getDateAndTime(endTime) : '';
  });

  timeText = promisedComputed('', async () => {
    const {
      repeat,
      repeatEndingAfter,
      repeatEnding,
      repeatEndingOn,
    } = this.task;

    return await getDurationTimeText(
      repeat,
      repeatEndingAfter,
      repeatEndingOn,
      repeatEnding,
    );
  });

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
