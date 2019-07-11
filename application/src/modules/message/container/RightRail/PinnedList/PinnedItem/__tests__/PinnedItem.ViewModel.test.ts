/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-02-19 16:10:37
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import { TypeDictionary, GlipTypeUtil } from 'sdk/utils';
import { PinnedItemViewModel } from '../PinnedItem.ViewModel';
import { ENTITY_NAME } from '@/store';

jest.mock('@/store/utils');
jest.mock('sdk/utils');

describe('PinnedItemViewModel', () => {
  let pinnedItemViewModel: PinnedItemViewModel;

  beforeEach(() => {
    jest.resetAllMocks();
    pinnedItemViewModel = new PinnedItemViewModel();
  });

  describe('get item', () => {
    it('Should be return file item', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_FILE);
      (getEntity as jest.Mock).mockImplementation(() => '');
      expect(pinnedItemViewModel.item).toBe('');
      expect(getEntity).toHaveBeenCalledWith(ENTITY_NAME.ITEM, undefined);
    });
    it('should be return task item', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_TASK);
      (getEntity as jest.Mock).mockImplementation(() => '');
      expect(pinnedItemViewModel.item).toBe('');
      expect(getEntity).toHaveBeenCalledWith(ENTITY_NAME.ITEM, undefined);
    });
    it('Should be return node item', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_PAGE);
      (getEntity as jest.Mock).mockImplementation(() => '');
      expect(pinnedItemViewModel.item).toBe('');
      expect(getEntity).toHaveBeenCalledWith(ENTITY_NAME.ITEM, undefined);
    });
    it('Should be return event item', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_EVENT);
      (getEntity as jest.Mock).mockImplementation(() => '');
      expect(pinnedItemViewModel.item).toBe('');
      expect(getEntity).toHaveBeenCalledWith(ENTITY_NAME.ITEM, undefined);
    });
    it('Should be return link item', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_LINK);
      (getEntity as jest.Mock).mockImplementation(() => '');
      expect(pinnedItemViewModel.item).toBe('');
      expect(getEntity).toHaveBeenCalledWith(ENTITY_NAME.ITEM, undefined);
    });
    it('Should be return code item', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_CODE);
      (getEntity as jest.Mock).mockImplementation(() => '');
      expect(pinnedItemViewModel.item).toBe('');
      expect(getEntity).toHaveBeenCalledWith(ENTITY_NAME.ITEM, undefined);
    });
  });

  describe('get text', () => {
    it('If item type is file item should be return name', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_FILE);
      (getEntity as jest.Mock).mockReturnValue({ name: 'name' });
      expect(pinnedItemViewModel.text).toBe('name');
    });
    it('If item type is task item should be return text', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_TASK);
      (getEntity as jest.Mock).mockReturnValue({ text: 'text' });
      expect(pinnedItemViewModel.text).toBe('text');
    });
    it('If item type is note item should be return title', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_PAGE);
      (getEntity as jest.Mock).mockReturnValue({ title: 'title' });
      expect(pinnedItemViewModel.text).toBe('title');
    });
    it('If item type is event item should be return text', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_EVENT);
      (getEntity as jest.Mock).mockReturnValue({ text: 'text' });
      expect(pinnedItemViewModel.text).toBe('text');
    });
    it('If item type is link item should be return title or url', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_LINK);
      (getEntity as jest.Mock).mockReturnValue({ title: 'title' });
      expect(pinnedItemViewModel.text).toBe('title');
      (getEntity as jest.Mock).mockReturnValue({ url: 'url' });
      expect(pinnedItemViewModel.text).toBe('url');
    });

    it('If item type is code item should be return title', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_CODE);
      (getEntity as jest.Mock).mockReturnValue({ title: 'title' });
      expect(pinnedItemViewModel.text).toBe('title');
    });
  });

  describe('get icon', () => {
    it('If item is image item should be return file icon', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_FILE);
      (getEntity as jest.Mock).mockReturnValue({ type: 'jpg' });
      expect(pinnedItemViewModel.icon).toBe('image_preview');
    });
    it('If item is file item should be return file icon', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_FILE);
      (getEntity as jest.Mock).mockReturnValue({ type: 'doc' });
      expect(pinnedItemViewModel.icon).toBe('doc');
    });
    it('If item is task item and task complete should be return tasks', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_TASK);
      (getEntity as jest.Mock).mockReturnValue({ complete: true });
      expect(pinnedItemViewModel.icon).toBe('tasks');
    });
    it('If item is notes item should be return notes', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_PAGE);
      (getEntity as jest.Mock).mockReturnValue({});
      expect(pinnedItemViewModel.icon).toBe('notes');
    });
    it('If item is event item should be return event', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_EVENT);
      (getEntity as jest.Mock).mockReturnValue({});
      expect(pinnedItemViewModel.icon).toBe('event');
    });
    it('If item is link item should be return link', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_LINK);
      (getEntity as jest.Mock).mockReturnValue({});
      expect(pinnedItemViewModel.icon).toBe('link');
    });

    it('If item is link item should be return code icon', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_CODE);
      (getEntity as jest.Mock).mockReturnValue({});
      expect(pinnedItemViewModel.icon).toBe('code');
    });
  });

  describe('get isFile', () => {
    it('If item type is file item should be return true', () => {
      jest
        .spyOn(GlipTypeUtil, 'extractTypeId')
        .mockReturnValue(TypeDictionary.TYPE_ID_FILE);
      expect(pinnedItemViewModel.isFile).toBeTruthy();
    });
  });
});
