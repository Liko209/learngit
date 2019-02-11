/*
 * @Author: isaac.liu
 * @Date: 2019-02-01 08:41:36
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { Post } from 'sdk/module/post/entity';
import PostModel from '@/store/models/Post';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { PinnedItemProps } from './types';
import { Item } from 'sdk/module/item/entity';
import { dateFormatter } from '@/utils/date';
import { TypeDictionary, GlipTypeUtil } from 'sdk/utils';
import { JuiPinnedItemProps } from 'jui/pattern/RightShelf/PinnedItem';
import FileItemModel from '@/store/models/FileItem';
import { FileItemUtils } from 'sdk/module/item/utils';
import TaskItemModel from '@/store/models/TaskItem';
import NoteItemModel from '@/store/models/NoteItem';
import EventItemModel from '@/store/models/EventItem';
import LinkItemModel from '@/store/models/LinkItem';

const ITEM_ICON_MAP = {
  [TypeDictionary.TYPE_ID_FILE]: (id: number) => {
    const file = getEntity<Item, FileItemModel>(ENTITY_NAME.ITEM, id);
    if (file && file.type && FileItemUtils.isImageItem(file)) {
      return 'image_preview';
    }
    return 'default_file';
  },
  [TypeDictionary.TYPE_ID_TASK]: 'tasks',
  [TypeDictionary.TYPE_ID_PAGE]: 'notes',
  [TypeDictionary.TYPE_ID_EVENT]: 'events',
  [TypeDictionary.TYPE_ID_LINK]: 'link',
};

const ITEM_TEXT_MAP = {
  [TypeDictionary.TYPE_ID_FILE]: (id: number) => {
    const file = getEntity<Item, FileItemModel>(ENTITY_NAME.ITEM, id);
    file.deactivated;
    return file.name;
  },
  [TypeDictionary.TYPE_ID_TASK]: (id: number) =>
    getEntity<Item, TaskItemModel>(ENTITY_NAME.TASK_ITEM, id).text,
  [TypeDictionary.TYPE_ID_PAGE]: (id: number) =>
    getEntity<Item, NoteItemModel>(ENTITY_NAME.NOTE_ITEM, id).title,
  [TypeDictionary.TYPE_ID_EVENT]: (id: number) =>
    getEntity<Item, EventItemModel>(ENTITY_NAME.EVENT_ITEM, id).text,
  [TypeDictionary.TYPE_ID_LINK]: (id: number) =>
    getEntity<Item, LinkItemModel>(ENTITY_NAME.LINK_ITEM, id).title,
};

class PinnedItemViewModel extends AbstractViewModel<PinnedItemProps> {
  @computed
  get _id() {
    return this.props.id;
  }

  @computed
  get post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this._id);
  }

  @computed
  get creator() {
    const { creatorId } = this.post;
    if (creatorId) {
      return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, creatorId);
    }
    return null;
  }

  @computed
  get creatorName() {
    const creator = this.creator;
    if (creator) {
      return creator.userDisplayName;
    }
    return '';
  }

  @computed
  get textContent() {
    return this.post.text;
  }

  @computed
  get createTime() {
    const { createdAt } = this.post;
    if (createdAt) {
      return dateFormatter.date(createdAt);
    }
    return '';
  }

  didUpdate = () => {
    this.props.didLoad();
  }

  _infoOfItem = (id: number, result: JuiPinnedItemProps[]) => {
    const type = GlipTypeUtil.extractTypeId(id);
    const iconMapper = ITEM_ICON_MAP[type];
    let icon: string = '';
    if (typeof iconMapper === 'function') {
      icon = iconMapper(id);
    } else {
      icon = iconMapper;
    }
    const textMapper = ITEM_TEXT_MAP[type];
    result.push({
      icon,
      text: textMapper ? textMapper(id) : '',
    });
  }

  @computed
  get items() {
    const { itemIds } = this.post;
    if (itemIds) {
      const result: JuiPinnedItemProps[] = [];
      itemIds.forEach((id: number) => this._infoOfItem(id, result));
      return result;
    }
    return [];
  }
}

export { PinnedItemViewModel };
