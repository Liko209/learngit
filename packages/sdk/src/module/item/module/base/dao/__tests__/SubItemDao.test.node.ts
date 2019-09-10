/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */

import { setup } from '../../../../../../dao/__tests__/utils';
import { SubItemDao } from '../SubItemDao';
import { SanitizedItem, Item } from '../../entity';
import { QUERY_DIRECTION } from '../../../../../../dao/constants';
import { DatabaseType } from 'foundation/db';

const Dexie = require('dexie');
// Create an IDBFactory at window.indexedDB so your code can use IndexedDB.
// Make IDBKeyRange global so your code can create key ranges.
Dexie.dependencies.indexedDB = require('fake-indexeddb');
Dexie.dependencies.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');

jest.mock('sdk/service/utils', () => {
  return {
    isIEOrEdge: false,
    isFirefox: false,
  };
});

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('Sub Item Dao', () => {
  let dao: SubItemDao<SanitizedItem>;

  function setUp() {
    const { database } = setup(DatabaseType.DexieDB);
    dao = new SubItemDao<SanitizedItem>('eventItem', database);
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  const groupId = 1;
  const groupId2 = 2;
  const item1 = {
    id: 1,
    group_ids: [groupId, groupId2],
    created_at: 1,
    name: 'item1',
  };

  const item2 = {
    id: 2,
    group_ids: [groupId],
    created_at: 2,
    name: 'item2',
  };

  const item3 = {
    id: 3,
    group_ids: [groupId],
    created_at: 3,
    name: 'item3',
  };

  const item4 = {
    id: 4,
    group_ids: [groupId2],
    created_at: 4,
  };

  const item5 = {
    id: 5,
    group_ids: [groupId2],
    created_at: 5,
    name: 'item5',
  };

  const item6 = {
    id: 6,
    group_ids: [groupId2],
    created_at: 6,
  };

  const item7 = {
    id: 7,
    group_ids: [groupId],
    created_at: 7,
    name: 'item7',
  };

  const item8 = {
    id: 8,
    group_ids: [groupId],
    created_at: 8,
    name: 'item8',
  };

  describe('queryItemsByGroupId', () => {
    const items = [item1, item2, item3, item4, item5];
    beforeEach(async () => {
      await dao.clear();
      await dao.bulkPut(items);
    });

    it('should return items by group id', async () => {
      const result = await dao.queryItemsByGroupId(1);
      expect(result).toHaveLength(3);
      expect(result).toEqual([item1, item2, item3]);
    });

    it('should return empty when not match', async () => {
      const result = await dao.queryItemsByGroupId(4);
      expect(result).toHaveLength(0);
    });
  });

  describe('getSortedIds()', () => {
    const items = [item1, item2, item3, item4, item5, item6];
    beforeAll(async () => {
      await dao.clear();
      await dao.bulkPut(items);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return count of items of the group', async () => {
      expect(await dao.getGroupItemCount(groupId)).toBe(3);
    });

    it('should return count of items of the group after filtered', async () => {
      const filterFunc = (item: Item) => {
        return item.id > 2;
      };
      expect(await dao.getGroupItemCount(groupId, filterFunc)).toBe(1);
    });
  });

  describe('getSortedIds()', () => {
    const items = [item1, item2, item3, item7, item8];
    const items2 = [item4, item5, item6];

    beforeEach(() => {
      jest.restoreAllMocks();
      jest
        .spyOn(dao, 'queryItemsByGroupId')
        .mockImplementation((gId: number) => {
          if (gId === groupId) {
            return items;
          }
          if (gId === groupId2) {
            return items2;
          }
        });
    });

    it('filter function should work', async () => {
      const filterFunc = (value: any) => {
        return value.id !== 1;
      };
      const result = await dao.getSortedIds({
        groupId,
        filterFunc,
        limit: 3,
        desc: true,
        typeId: 10,
        sortKey: 'name',
        offsetItemId: undefined,
      });
      expect(result).toEqual([item8.id, item7.id, item3.id]);
    });

    it.each`
      groupId     | sortKey         | limit | offsetItemId | expects                           | desc     | comment                           | direction
      ${groupId}  | ${'name'}       | ${3}  | ${undefined} | ${[item8.id, item7.id, item3.id]} | ${true}  | ${'sort by name desc'}            | ${undefined}
      ${groupId}  | ${'name'}       | ${3}  | ${undefined} | ${[item1.id, item2.id, item3.id]} | ${false} | ${'sort by name asc'}             | ${undefined}
      ${groupId}  | ${'created_at'} | ${3}  | ${undefined} | ${[item8.id, item7.id, item3.id]} | ${true}  | ${'sort by created_at desc'}      | ${undefined}
      ${groupId}  | ${'created_at'} | ${3}  | ${undefined} | ${[item1.id, item2.id, item3.id]} | ${false} | ${'sort by created_at asc'}       | ${undefined}
      ${groupId}  | ${'created_at'} | ${2}  | ${1}         | ${[item2.id, item3.id]}           | ${false} | ${'slice limit 2, offset item 1'} | ${undefined}
      ${groupId}  | ${'created_at'} | ${2}  | ${2}         | ${[item3.id, item7.id]}           | ${false} | ${'slice limit 2, offset item 2'} | ${undefined}
      ${groupId2} | ${'name'}       | ${3}  | ${5}         | ${[item6.id, item4.id]}           | ${true}  | ${'compare incomplete item desc'} | ${undefined}
      ${groupId2} | ${'name'}       | ${3}  | ${4}         | ${[item6.id, item5.id]}           | ${false} | ${'compare incomplete item asc'}  | ${undefined}
      ${groupId}  | ${'created_at'} | ${3}  | ${item3.id}  | ${[item2.id, item3.id, item7.id]} | ${false} | ${'sort by created_at asc'}       | ${QUERY_DIRECTION.BOTH}
      ${groupId}  | ${'created_at'} | ${3}  | ${item1.id}  | ${[item1.id, item2.id, item3.id]} | ${false} | ${'sort by created_at asc'}       | ${QUERY_DIRECTION.BOTH}
      ${groupId}  | ${'created_at'} | ${3}  | ${item7.id}  | ${[item3.id, item7.id, item8.id]} | ${false} | ${'sort by created_at asc'}       | ${QUERY_DIRECTION.BOTH}
    `(
      '$comment, $expects, $direction',
      async ({
        groupId,
        sortKey,
        limit,
        offsetItemId,
        desc,
        expects,
        direction,
      }) => {
        const result = await dao.getSortedIds({
          groupId,
          limit,
          offsetItemId,
          sortKey,
          desc,
          direction,
          typeId: 10,
        });
        expect(result).toEqual(expects);
      },
    );
  });

  describe('toSanitizedItem', () => {
    it('should return sanitized item', () => {
      const item = {
        id: 1111,
        group_ids: [123123],
        created_at: 1231233,
        name: '1231233',
      } as Item;

      expect(dao.toSanitizedItem(item)).toEqual({
        id: 1111,
        group_ids: [123123],
        created_at: 1231233,
      });
    });
  });

  describe('toPartialSanitizedItem', () => {
    const item = {
      id: 1111,
      group_ids: [123123],
      created_at: 1231233,
      name: '1231233',
      gg: 'gg',
    } as Partial<Item>;

    const itemResult = {
      id: 1111,
      group_ids: [123123],
      created_at: 1231233,
    };

    const item2 = {
      group_ids: [123123],
      name: '1231233',
      gg: 'gg',
    } as Partial<Item>;

    const item2Result = {
      group_ids: [123123],
    };

    const item3 = {
      created_at: 1231233,
      name: '1231233',
      gg: 'gg',
    } as Partial<Item>;

    const item3Result = {
      created_at: 1231233,
    } as Partial<Item>;

    it.each`
      partialItem | result         | comments
      ${item}     | ${itemResult}  | ${'id, group_ids, created_at'}
      ${item2}    | ${item2Result} | ${'group_ids'}
      ${item3}    | ${item3Result} | ${' created_at'}
    `('$comments', ({ partialItem, result }) => {
      expect(dao.toPartialSanitizedItem(partialItem)).toEqual(result);
    });
  });

  describe('update', () => {
    const items = [item1, item2, item3, item4, item5];

    beforeEach(async () => {
      await dao.clear();
      await dao.bulkPut(items);
    });

    const newItem = {
      id: 99,
      group_ids: [groupId2],
      created_at: 99,
      name: 'item5',
    };

    const newItem5 = {
      id: 5,
      group_ids: [groupId2, groupId],
      created_at: 777,
    };

    it('should not save not existed items when doing update', async () => {
      const curAll = (await dao.getAll()).map(x => x.id);
      expect(curAll).toEqual([1, 2, 3, 4, 5]);
      await dao.update(newItem);
      const newAll = (await dao.getAll()).map(x => x.id);
      expect(newAll).toEqual([1, 2, 3, 4, 5]);
    });

    it('should update existed items when doing update', async () => {
      const oldItem5 = await dao.get(item5.id);
      expect(oldItem5).toEqual(item5);
      await dao.update(newItem5, false);
      const newItem5FromDB = await dao.get(item5.id);
      expect(newItem5FromDB).toEqual({
        ...newItem5,
        name: 'item5',
      });
    });

    it('should update items when input is array', async () => {
      const oldItem5 = await dao.get(item5.id);
      expect(oldItem5).toEqual(item5);
      await dao.bulkUpdate([newItem5], false);
      const newItem5FromDB = await dao.get(item5.id);
      expect(newItem5FromDB).toEqual({
        ...newItem5,
        name: 'item5',
      });
    });
  });

  describe('bulkUpdate', () => {
    const items = [item1, item2, item3, item4, item5];

    beforeEach(async () => {
      await dao.clear();
      await dao.bulkPut(items);
    });

    const newItem = {
      id: 99,
      group_ids: [groupId2],
      created_at: 99,
      name: 'item5',
    };

    const newItem5 = {
      id: 5,
      group_ids: [groupId2, groupId],
      created_at: 777,
    };

    it('should not save not existed items when doing bulkUpdate', async () => {
      const curAll = (await dao.getAll()).map(x => x.id);
      expect(curAll).toEqual([1, 2, 3, 4, 5]);
      await dao.bulkUpdate([newItem], false);
      const newAll = (await dao.getAll()).map(x => x.id);
      expect(newAll).toEqual([1, 2, 3, 4, 5]);
    });

    it('should update existed items when doing bulkUpdate', async () => {
      const oldItem5 = await dao.get(item5.id);
      expect(oldItem5).toEqual(item5);
      await dao.bulkUpdate([newItem5], false);
      const newItem5FromDB = await dao.get(item5.id);
      expect(newItem5FromDB).toEqual({
        ...newItem5,
        name: 'item5',
      });
    });
  });

  describe('shouldSaveSubItem', () => {
    it('should return true when item has id > 0 && has post ids', () => {
      const item = {
        id: 1,
        post_ids: [1],
      };

      expect(dao.shouldSaveSubItem(item)).toBeTruthy();
    });

    it('should return true when item id < 0', () => {
      const item = {
        id: -1,
        post_ids: [1],
      };

      expect(dao.shouldSaveSubItem(item)).toBeFalsy();
    });

    it('should return true when has no post ids', () => {
      const item = {
        id: 1,
      };

      expect(dao.shouldSaveSubItem(item)).toBeFalsy();
    });

    it('should return true when post ids length is 0 ', () => {
      const item = {
        id: 1,
        post_ids: [],
      };

      expect(dao.shouldSaveSubItem(item)).toBeFalsy();
    });
  });
});
