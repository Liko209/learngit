/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-11 18:36:19
 * Copyright © RingCentral. All rights reserved.
 */

import TypeDictionary from 'sdk/utils/glip-type-dictionary/types';
import FileItemModel from '../models/FileItem';
import TaskItemModel from '../models/TaskItem';
import LinkItemModel from '../models/LinkItem';
import NoteItemModel from '../models/NoteItem';
import CodeItemModel from '../models/CodeItem';
import EventItemModel from '../models/EventItem';
import ConferenceItemModel from '../models/ConferenceItem';
import ItemModel from '../models/Item';
import { IdModel } from 'sdk/framework/model';

import GlipTypeUtil from 'sdk/utils/glip-type-dictionary/util';
import {
  Item,
  TaskItem,
  NoteItem,
  CodeItem,
  LinkItem,
  EventItem,
  ConferenceItem,
} from 'sdk/module/item/entity';

class ModelCreator {
  static createItemModel(model: IdModel): ItemModel {
    let itemModel: ItemModel;
    const type = GlipTypeUtil.extractTypeId(model.id);
    switch (type) {
      case TypeDictionary.TYPE_ID_FILE:
        itemModel = new FileItemModel(model as Item);
        break;
      case TypeDictionary.TYPE_ID_TASK:
        itemModel = new TaskItemModel(model as TaskItem);
        break;
      case TypeDictionary.TYPE_ID_LINK:
        itemModel = new LinkItemModel(model as LinkItem);
        break;
      case TypeDictionary.TYPE_ID_PAGE:
        itemModel = new NoteItemModel(model as NoteItem);
        break;
      case TypeDictionary.TYPE_ID_CODE:
        itemModel = new CodeItemModel(model as CodeItem);
        break;
      case TypeDictionary.TYPE_ID_EVENT:
        itemModel = new EventItemModel(model as EventItem);
        break;
      case TypeDictionary.TYPE_ID_CONFERENCE:
        itemModel = new ConferenceItemModel(model as ConferenceItem);
        break;
      default:
        itemModel = new ItemModel(model as Item);
        break;
    }
    return itemModel;
  }
}

export { ModelCreator };
