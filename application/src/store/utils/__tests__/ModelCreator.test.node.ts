/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-15 15:13:05
 * Copyright © RingCentral. All rights reserved.
 */

import { ModelCreator } from '../ModelCreator';

import FileItemModel from '@/store/models/FileItem';
import TaskItemModel from '@/store/models/TaskItem';
import TypeDictionary from 'sdk/utils/glip-type-dictionary/types';
import LinkItemModel from '@/store/models/LinkItem';
import NoteItemModel from '@/store/models/NoteItem';
import CodeItemModel from '@/store/models/CodeItem';
import EventItemModel from '@/store/models/EventItem';
import ConferenceItemModel from '@/store/models/ConferenceItem';
import ItemModel from '@/store/models/Item';

export { ModelCreator } from '../ModelCreator';

describe('ModelCreator', () => {
  describe('createItemModel', () => {
    it('should return FileItemModel when item is FileItem', () => {
      const item = { id: TypeDictionary.TYPE_ID_FILE };
      const result = ModelCreator.createItemModel(item);
      expect(result instanceof FileItemModel).toBeTruthy();
    });

    it('should return TaskItemModel when item is TaskItem', () => {
      const item = { id: TypeDictionary.TYPE_ID_TASK };
      const result = ModelCreator.createItemModel(item);
      expect(result instanceof TaskItemModel).toBeTruthy();
    });

    it('should return LinkItemModel when item is LinkItem', () => {
      const item = { id: TypeDictionary.TYPE_ID_LINK };
      const result = ModelCreator.createItemModel(item);
      expect(result instanceof LinkItemModel).toBeTruthy();
    });

    it('should return NoteItemModel when item is NoteItem', () => {
      const item = { id: TypeDictionary.TYPE_ID_PAGE };
      const result = ModelCreator.createItemModel(item);
      expect(result instanceof NoteItemModel).toBeTruthy();
    });

    it('should return CodeItemModel when item is CodeItem', () => {
      const item = { id: TypeDictionary.TYPE_ID_CODE };
      const result = ModelCreator.createItemModel(item);
      expect(result instanceof CodeItemModel).toBeTruthy();
    });

    it('should return EventItemModel when item is EventItem', () => {
      const item = { id: TypeDictionary.TYPE_ID_EVENT };
      const result = ModelCreator.createItemModel(item);
      expect(result instanceof EventItemModel).toBeTruthy();
    });

    it('should return ConferenceItemModel when item is ConferenceItem', () => {
      const item = { id: TypeDictionary.TYPE_ID_CONFERENCE };
      const result = ModelCreator.createItemModel(item);
      expect(result instanceof ConferenceItemModel).toBeTruthy();
    });

    it('should return ItemModel when item is unknown', () => {
      const item = { id: Infinity };
      const result = ModelCreator.createItemModel(item);
      expect(result instanceof ItemModel).toBeTruthy();
    });
  });
});
