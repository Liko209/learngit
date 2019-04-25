/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-02-19 14:26:49
 * Copyright © RingCentral. All rights reserved.
 */
import { TypeDictionary } from 'sdk/utils';
import FileItemModel from '@/store/models/FileItem';
import { FileItemUtils } from 'sdk/module/item/utils';
import TaskItemModel from '@/store/models/TaskItem';
import NoteItemModel from '@/store/models/NoteItem';
import EventItemModel from '@/store/models/EventItem';
import LinkItemModel from '@/store/models/LinkItem';
import { getFileIcon } from '@/common/getFileIcon';

type ITEM_MODEL_TYPES =
  | FileItemModel
  | TaskItemModel
  | NoteItemModel
  | EventItemModel
  | LinkItemModel;

const ITEM_ICON_MAP = {
  [TypeDictionary.TYPE_ID_FILE]: (
    item: Extract<ITEM_MODEL_TYPES, FileItemModel>,
  ) => {
    if (item && item.type && FileItemUtils.isImageItem(item)) {
      return 'image_preview';
    }
    return getFileIcon(item.type);
  },
  [TypeDictionary.TYPE_ID_TASK]: 'tasks',
  [TypeDictionary.TYPE_ID_PAGE]: 'notes',
  [TypeDictionary.TYPE_ID_EVENT]: 'event',
  [TypeDictionary.TYPE_ID_LINK]: 'link',
};

const ITEM_TEXT_MAP = {
  [TypeDictionary.TYPE_ID_FILE]: 'name',
  [TypeDictionary.TYPE_ID_TASK]: 'text',
  [TypeDictionary.TYPE_ID_PAGE]: 'title',
  [TypeDictionary.TYPE_ID_EVENT]: 'text',
  [TypeDictionary.TYPE_ID_LINK]: (
    item: Extract<ITEM_MODEL_TYPES, LinkItemModel>,
  ) => {
    if (item && item.title) {
      return 'title';
    }
    return 'url';
  },
};

export { ITEM_MODEL_TYPES, ITEM_ICON_MAP, ITEM_TEXT_MAP };
