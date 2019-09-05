/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-21 14:58:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ItemDao } from '..';
import { setup } from '../../../../dao/__tests__/utils';
import { Item } from '../../entity';
import { itemFactory } from '../../../../__tests__/factories';

import { FileItemDao } from '../../module/file/dao';
import { TaskItemDao } from '../../module/task/dao';
import { EventItemDao } from '../../module/event/dao';
import { NoteItemDao } from '../../module/note/dao';
import { LinkItemDao } from '../../module/link/dao';
import { GlipTypeUtil, TypeDictionary } from '../../../../utils';
import { DatabaseType } from 'foundation/db';

jest.mock('../../module/file/dao');
jest.mock('../../module/task/dao');
jest.mock('../../module/event/dao');
jest.mock('../../module/note/dao');
jest.mock('../../module/link/dao');

const Dexie = require('dexie');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}
// Create an IDBFactory at window.indexedDB so your code can use IndexedDB.
// Make IDBKeyRange global so your code can create key ranges.

describe('Item Dao', () => {
  let itemDao: ItemDao;
  Dexie.dependencies.indexedDB = require('fake-indexeddb');
  Dexie.dependencies.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');

  const viewDaosMap = new Map([
    [TypeDictionary.TYPE_ID_FILE, new FileItemDao(null)],
    [TypeDictionary.TYPE_ID_TASK, new TaskItemDao(null)],
    [TypeDictionary.TYPE_ID_EVENT, new EventItemDao(null)],
    [TypeDictionary.TYPE_ID_PAGE, new NoteItemDao(null)],
    [TypeDictionary.TYPE_ID_LINK, new LinkItemDao(null)],
  ]);

  function setUpViewDaos() {
    Object.assign(itemDao, { _viewDaoMap: viewDaosMap });
  }

  beforeAll(() => {
    clearMocks();
    const { database } = setup(DatabaseType.DexieDB);
    itemDao = new ItemDao(database);
  });

  afterEach(async () => {
    await itemDao.clear();
    clearMocks();
  });

  it('Save item', async () => {
    const item: Item = itemFactory.build({ id: 100 });
    await itemDao.put(item);
    const matchedItem = await itemDao.get(100);
    expect(matchedItem).toMatchObject(item);
  });

  function buildTestItems(): Item[] {
    const items: Item[] = [
      itemFactory.build({
        id: 1,
        group_ids: [123],
        name: 'file1',
      }),
      itemFactory.build({
        id: 2,
        group_ids: [123, 444],
        name: 'file2',
      }),
      itemFactory.build({
        id: 3,
        group_ids: [321],
        name: 'file3',
      }),
      itemFactory.build({
        id: 4,
        group_ids: [123, 321],
        name: 'file4',
      }),
      itemFactory.build({
        id: -5,
        group_ids: [321],
        name: 'file5',
      }),
    ];
    return items;
  }

  describe('isFileItemExist()', () => {
    const items: Item[] = buildTestItems();
    beforeEach(async () => {
      const { database } = setup(DatabaseType.DexieDB);
      itemDao = new ItemDao(database);
      await itemDao.bulkPut(items);
    });

    it.each`
      groupId | fileName   | res      | excludePseudo | comment
      ${123}  | ${'file1'} | ${true}  | ${true}       | ${'group id and name all match'}
      ${321}  | ${'file4'} | ${true}  | ${true}       | ${'group id and name all match but group id is in a array'}
      ${321}  | ${'file5'} | ${true}  | ${false}      | ${'should match pseudo item'}
      ${123}  | ${'file3'} | ${false} | ${true}       | ${'group match, file not match'}
      ${999}  | ${'file3'} | ${false} | ${true}       | ${'group not match , file not match'}
      ${321}  | ${'file5'} | ${false} | ${true}       | ${'should not match pseudo item'}
    `(
      'should return true when item matched: $comment',
      async ({ groupId, fileName, excludePseudo, res }) => {
        const result = await itemDao.isFileItemExist(
          groupId,
          fileName,
          excludePseudo,
        );
        expect(result).toEqual(res);
      },
    );
  });

  describe('getExistGroupFilesByName()', () => {
    const items: Item[] = buildTestItems();
    beforeEach(async () => {
      const { database } = setup(DatabaseType.DexieDB);
      itemDao = new ItemDao(database);
      await itemDao.bulkPut(items);
    });

    it.each`
      groupId | fileName   | res           | excludePseudo | comment
      ${123}  | ${'file1'} | ${[items[0]]} | ${true}       | ${'group id and name all match'}
      ${321}  | ${'file4'} | ${[items[3]]} | ${true}       | ${'group id and name all match but group id is in a array'}
      ${321}  | ${'file5'} | ${[items[4]]} | ${false}      | ${'should match pseudo item'}
      ${123}  | ${'file3'} | ${[]}         | ${true}       | ${'group match, file not match'}
      ${999}  | ${'file3'} | ${[]}         | ${true}       | ${'group not match , file not match'}
      ${321}  | ${'file5'} | ${[]}         | ${true}       | ${'should not match pseudo item'}
    `(
      'should return matched items: $comment',
      async ({ groupId, fileName, excludePseudo, res }) => {
        const result = await itemDao.getExistGroupFilesByName(
          groupId,
          fileName,
          excludePseudo,
        );
        expect(result).toEqual(res);
      },
    );
  });

  describe('put', () => {
    beforeEach(() => {
      clearMocks();
      setUpViewDaos();
    });

    const testItem = itemFactory.build({
      id: 10,
      created_at: 111,
      group_ids: [123],
      post_ids: [123123],
      name: 'name',
      type: 'type',
      mod: 'mod',
    });

    it('should call view dao when item is type that should be saved', async () => {
      const viewDao = viewDaosMap.get(GlipTypeUtil.extractTypeId(testItem.id));
      viewDao.shouldSaveSubItem = jest.fn().mockReturnValue(true);
      viewDao.toSanitizedItem = jest.fn().mockImplementation((item: any) => {
        return item;
      });
      await itemDao.put(testItem);

      expect(viewDao.shouldSaveSubItem).toHaveBeenCalled();
      expect(viewDao.toSanitizedItem).toHaveBeenCalled();
      expect(viewDao.put).toHaveBeenCalledWith(testItem);
    });

    it('should not call view dao when item is type that should not be saved', async () => {
      const viewDao = viewDaosMap.get(GlipTypeUtil.extractTypeId(testItem.id));
      viewDao.shouldSaveSubItem = jest.fn().mockReturnValue(false);
      viewDao.toSanitizedItem = jest.fn().mockImplementation((item: any) => {
        return item;
      });
      await itemDao.put(testItem);

      expect(viewDao.shouldSaveSubItem).toHaveBeenCalled();
      expect(viewDao.toSanitizedItem).not.toHaveBeenCalled();
      expect(viewDao.put).not.toHaveBeenCalled();
    });
  });

  describe('bulkPut', () => {
    beforeEach(() => {
      clearMocks();
      setUpViewDaos();
    });

    const testItem = itemFactory.build({
      id: 10,
      created_at: 111,
      group_ids: [123],
      post_ids: [123123],
      name: 'name',
      type: 'type',
      mod: 'mod',
    });

    it('should call bulkPut in view dao when item is type that should be saved', async () => {
      const viewDao = viewDaosMap.get(GlipTypeUtil.extractTypeId(testItem.id));
      viewDao.shouldSaveSubItem = jest.fn().mockReturnValue(true);
      viewDao.toSanitizedItem = jest.fn().mockImplementation((item: any) => {
        return item;
      });
      await itemDao.bulkPut([testItem]);

      expect(viewDao.shouldSaveSubItem).toHaveBeenCalled();
      expect(viewDao.toSanitizedItem).toHaveBeenCalled();
      expect(viewDao.bulkPut).toHaveBeenCalledWith([testItem]);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      clearMocks();
      setUpViewDaos();
    });

    const testItem = itemFactory.build({
      id: 10,
      created_at: 111,
      group_ids: [123],
      post_ids: [123123],
      name: 'name',
      type: 'type',
      mod: 'mod',
    });

    it('should call view dao when item is doing update', async () => {
      const viewDao = viewDaosMap.get(GlipTypeUtil.extractTypeId(testItem.id));
      viewDao.toPartialSanitizedItem = jest
        .fn()
        .mockImplementation((item: any) => {
          return item;
        });
      await itemDao.update(testItem);

      expect(viewDao.toPartialSanitizedItem).toHaveBeenCalled();
      expect(viewDao.update).toHaveBeenCalledWith(testItem, false);
    });
  });

  describe('bulkUpdate', () => {
    beforeEach(() => {
      clearMocks();
      setUpViewDaos();
    });

    const testItem = itemFactory.build({
      id: 10,
      created_at: 111,
      group_ids: [123],
      post_ids: [123123],
      name: 'name',
      type: 'type',
      mod: 'mod',
    });
    const shouldNotPutItems = itemFactory.build({
      id: 30410571786,
      created_at: 111,
      group_ids: [123],
      post_ids: [],
      name: 'name',
      type: 'type',
      mod: 'mod',
    });

    it('should call view dao when item is doing bulk update', async () => {
      const viewDao = viewDaosMap.get(GlipTypeUtil.extractTypeId(testItem.id));
      viewDao.bulkUpdate = jest.fn().mockImplementation(() => {
        return Promise.resolve();
      });
      viewDao.shouldSaveSubItem = jest.fn().mockImplementation((item: any) => {
        return !!(item.id > 0 && item.post_ids && item.post_ids.length > 0);
      });
      viewDao.toPartialSanitizedItem = jest
        .fn()
        .mockImplementation((item: any) => {
          return item;
        });
      await itemDao.bulkUpdate([testItem, shouldNotPutItems]);
      expect(viewDao.toPartialSanitizedItem).toHaveBeenCalled();
      expect(viewDao.bulkUpdate).toHaveBeenNthCalledWith(1, [testItem], true);
      expect(viewDao.bulkUpdate).toHaveBeenNthCalledWith(
        2,
        [shouldNotPutItems],
        false,
      );
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      clearMocks();
      setUpViewDaos();
    });

    it('should call delete and delete items in view daos when item has its view dao ', async () => {
      const itemId = TypeDictionary.TYPE_ID_FILE;
      await itemDao.delete(itemId);

      expect(
        (viewDaosMap.get(TypeDictionary.TYPE_ID_FILE) as FileItemDao).delete,
      ).toHaveBeenCalledWith(itemId);
    });

    it('should not call delete items in view daos when item has no its view dao ', async () => {
      const itemId = TypeDictionary.TYPE_ID_FILE + 1;
      await itemDao.delete(itemId);

      expect(
        (viewDaosMap.get(TypeDictionary.TYPE_ID_FILE) as FileItemDao).delete,
      ).not.toHaveBeenCalled();
    });
  });

  describe('bulkDelete', () => {
    beforeEach(() => {
      clearMocks();
      setUpViewDaos();
    });

    const itemIds = Array.from(viewDaosMap.keys());
    it('should call bulk delete and delete items in view daos ', async () => {
      await itemDao.bulkDelete(itemIds);
      const viewDaos = Array.from(viewDaosMap.values());
      const keys = Array.from(viewDaosMap.keys());
      let i = 0;
      viewDaos.forEach((val: any) => {
        expect(val.bulkDelete).toHaveBeenCalledWith([keys[i]]);
        i++;
      });
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      clearMocks();
      setUpViewDaos();
    });

    it('should clear dao and all view daos', async () => {
      expect.assertions(5);
      await itemDao.clear();

      const viewDaos = Array.from(viewDaosMap.values());
      viewDaos.forEach((val: any) => {
        expect(val.clear).toHaveBeenCalled();
      });
    });
  });
});
