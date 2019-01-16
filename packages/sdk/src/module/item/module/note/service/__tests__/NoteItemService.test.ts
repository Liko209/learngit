/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-16 12:14:37
 * Copyright © RingCentral. All rights reserved.
 */

/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-16 10:35:03
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager } from '../../../../../../dao';
import { IItemService } from '../../../../service/IItemService';
import { NoteItemDao } from '../../dao/NoteItemDao';
import { NoteItemService } from '../NoteItemService';
import { NoteItem } from '../../entity';

jest.mock('../../controller/NoteItemController');
jest.mock('../../../../../../dao');
jest.mock('../../dao/NoteItemDao');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('NoteItemService', () => {
  const itemService = {};
  let noteItemService: NoteItemService;
  let noteItemDao: NoteItemDao;

  function setup() {
    noteItemDao = new NoteItemDao(null);
    daoManager.getDao = jest.fn().mockReturnValue(noteItemDao);
    noteItemService = new NoteItemService(itemService as IItemService);
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  function setUpData() {
    const noteItem = {
      id: 123123,
      created_at: 11231333,
      group_ids: [123],
    };

    return { noteItem };
  }

  describe('createItem', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should sanitize item and create it', async () => {
      const { noteItem } = setUpData();
      noteItemDao.put = jest.fn();
      await noteItemService.createItem(noteItem);
      expect(noteItemDao.put).toBeCalledWith({
        id: noteItem.id,
        group_ids: noteItem.group_ids,
        created_at: noteItem.created_at,
      });
    });
  });

  describe('updateItem', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should sanitize item and update it', async () => {
      const { noteItem } = setUpData();
      noteItemDao.update = jest.fn();
      await noteItemService.updateItem(noteItem);
      expect(noteItemDao.update).toBeCalledWith({
        id: noteItem.id,
        group_ids: noteItem.group_ids,
        created_at: noteItem.created_at,
      });
    });
  });

  describe('deleteItem', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should  delete it', async () => {
      const { noteItem } = setUpData();
      noteItemDao.delete = jest.fn();
      await noteItemService.deleteItem(noteItem.id);
      expect(noteItemDao.delete).toBeCalledWith(noteItem.id);
    });
  });

  describe('getSortedIds', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call dao and get id', async () => {
      const ids = [12, 33, 44];
      const options = { groupId: 1 };
      noteItemDao.getSortedIds = jest.fn().mockResolvedValue(ids);
      const res = await noteItemService.getSortedIds(options);
      expect(noteItemDao.getSortedIds).toBeCalledWith(options);
      expect(res).toEqual(ids);
    });
  });

  describe('getSubItemsCount', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call dao and get count', async () => {
      const groupId = 111;
      const cnt = 999;
      noteItemDao.getGroupItemCount = jest.fn().mockResolvedValue(cnt);
      expect(await noteItemService.getSubItemsCount(groupId)).toBe(cnt);
      expect(noteItemDao.getGroupItemCount).toBeCalledWith(groupId, undefined);
    });
  });
});
