/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */

import { setup } from '../../../../../../dao/__tests__/utils';
import { SubItemDao } from '../SubItemDao';
import { SanitizedItem } from '../../entity';

describe('Event Item Dao', () => {
  let dao: SubItemDao<SanitizedItem>;

  beforeAll(() => {
    const { database } = setup();
    dao = new SubItemDao<SanitizedItem>('eventItem', database);
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

  describe('queryItemsByGroupId', () => {
    const items = [item1, item2, item3, item4, item5];
    beforeAll(async () => {
      await dao.clear();
      await dao.bulkPut(items);
    });

    afterEach(() => {
      jest.restoreAllMocks();
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
  });

  describe('getSortedIds()', () => {
    const items = [item1, item2, item3];
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

    it.each`
      groupId     | sortKey         | limit | offsetItemId | expects                           | desc     | comment
      ${groupId}  | ${'name'}       | ${3}  | ${undefined} | ${[item3.id, item2.id, item1.id]} | ${true}  | ${'sort by name desc'}
      ${groupId}  | ${'name'}       | ${3}  | ${undefined} | ${[item1.id, item2.id, item3.id]} | ${false} | ${'sort by name asc'}
      ${groupId}  | ${'created_at'} | ${3}  | ${undefined} | ${[item3.id, item2.id, item1.id]} | ${true}  | ${'sort by created_at desc'}
      ${groupId}  | ${'created_at'} | ${3}  | ${undefined} | ${[item1.id, item2.id, item3.id]} | ${false} | ${'sort by created_at asc'}
      ${groupId}  | ${'created_at'} | ${2}  | ${1}         | ${[item2.id, item3.id]}           | ${false} | ${'slice limit 2, offset item 1'}
      ${groupId}  | ${'created_at'} | ${2}  | ${2}         | ${[item3.id]}                     | ${false} | ${'slice limit 2, offset item 2'}
      ${groupId2} | ${'name'}       | ${3}  | ${5}         | ${[item4.id, item6.id]}           | ${true}  | ${'compare incomplete item desc'}
      ${groupId2} | ${'name'}       | ${3}  | ${4}         | ${[item6.id, item5.id]}           | ${false} | ${'compare incomplete item asc'}
    `(
      '$comment',
      async ({ groupId, sortKey, limit, offsetItemId, desc, expects }) => {
        const result = await dao.getSortedIds({
          groupId,
          limit,
          offsetItemId,
          sortKey,
          desc,
          typeId: 10,
        });
        expect(result).toEqual(expects);
      },
    );
  });
});
