/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-02-19 13:26:41
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';

import FileItemModel from '@/store/models/FileItem';
import { getEntity } from '@/store/utils';
import { PinnedItemProps } from './types';
import { Item } from 'sdk/module/item/entity';
import { TypeDictionary, GlipTypeUtil } from 'sdk/utils';
import TaskItemModel from '@/store/models/TaskItem';
import NoteItemModel from '@/store/models/NoteItem';
import EventItemModel from '@/store/models/EventItem';
import LinkItemModel from '@/store/models/LinkItem';

import { ITEM_ICON_MAP, ITEM_MODEL_TYPES, ITEM_TEXT_MAP } from './config';
import { ENTITY_NAME } from '@/store';

class PinnedItemViewModel extends AbstractViewModel<PinnedItemProps> {
  @computed
  get _id() {
    return this.props.id;
  }

  @computed
  get item() {
    let item: ITEM_MODEL_TYPES = {} as ITEM_MODEL_TYPES;
    switch (this.itemType) {
      case TypeDictionary.TYPE_ID_FILE: {
        item = getEntity<Item, FileItemModel>(ENTITY_NAME.ITEM, this._id);
        break;
      }
      case TypeDictionary.TYPE_ID_TASK: {
        item = getEntity<Item, TaskItemModel>(ENTITY_NAME.ITEM, this._id);
        break;
      }
      case TypeDictionary.TYPE_ID_PAGE: {
        item = getEntity<Item, NoteItemModel>(ENTITY_NAME.ITEM, this._id);
        break;
      }
      case TypeDictionary.TYPE_ID_EVENT: {
        item = getEntity<Item, EventItemModel>(ENTITY_NAME.ITEM, this._id);
        break;
      }
      case TypeDictionary.TYPE_ID_LINK: {
        item = getEntity<Item, LinkItemModel>(ENTITY_NAME.ITEM, this._id);
        break;
      }
      default:
        break;
    }
    return item;
  }

  @computed
  get text() {
    type ProcessFunc = (item: ITEM_MODEL_TYPES) => string;
    const textMapper = ITEM_TEXT_MAP[this.itemType];
    const text =
      typeof textMapper === 'function'
        ? (textMapper as ProcessFunc)(this.item)
        : textMapper;
    return this.item[text];
  }

  @computed
  get icon() {
    type ProcessFunc = (item: ITEM_MODEL_TYPES) => string;
    const iconMapper = ITEM_ICON_MAP[this.itemType];
    return typeof iconMapper === 'function'
      ? (iconMapper as ProcessFunc)(this.item)
      : iconMapper;
  }

  @computed
  get isFile() {
    return this.itemType === TypeDictionary.TYPE_ID_FILE;
  }

  @computed
  get itemType() {
    return GlipTypeUtil.extractTypeId(this._id);
  }
}

export { PinnedItemViewModel };
