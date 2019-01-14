/*
 * @Author: Paynter Chen
 * @Date: 2019-01-14 17:42:21
 * Copyright © RingCentral. All rights reserved.
 */

import { setup } from '../../../../../../dao/__tests__/utils';
import { CodeItemDao } from '../CodeItemDao';

describe('Code Item Dao', () => {
  let dao: CodeItemDao;

  beforeAll(() => {
    const { database } = setup();
    dao = new CodeItemDao(database);
  });

  describe('queryItemsByGroupId', () => {
    const items = [
      {
        id: 1,
        group_ids: [1],
        created_at: 1,
        name: 'item1',
      },
      {
        id: 2,
        group_ids: [1],
        created_at: 2,
        name: 'item2',
      },
      {
        id: 3,
        group_ids: [2],
        created_at: 3,
        name: 'item3',
      },
    ];
    beforeAll(async () => {
      await dao.clear();
      await dao.bulkPut(items);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return items by group id', async () => {
      const result = await dao.queryItemsByGroupId(1);
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        {
          id: 1,
          group_ids: [1],
          created_at: 1,
          name: 'item1',
        },
        {
          id: 2,
          group_ids: [1],
          created_at: 2,
          name: 'item2',
        },
      ]);
    });
    it('should return empty when not match', async () => {
      const result = await dao.queryItemsByGroupId(4);
      expect(result).toHaveLength(0);
    });
  });
});
