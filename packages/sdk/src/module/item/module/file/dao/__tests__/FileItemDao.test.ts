/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */

import { setup } from '../../../../../../dao/__tests__/utils';
import { FileItemDao } from '../FileItemDao';

describe('Event Item Dao', () => {
  let dao: FileItemDao;

  const items = [
    {
      id: 1,
      group_ids: [1],
      created_at: 1,
      name: 'item1',
      type: 'jpg',
    },
    {
      id: 2,
      group_ids: [1],
      created_at: 2,
      name: 'item2',
      type: 'png',
    },
    {
      id: 3,
      group_ids: [2],
      created_at: 3,
      name: 'item3',
      type: 'exe',
    },
    {
      id: 4,
      group_ids: [1],
      created_at: 3,
      name: 'item4',
      type: 'txt',
    },
  ];

  beforeAll(() => {
    const { database } = setup();
    dao = new FileItemDao(database);
  });

  describe('queryItemsByGroupId', () => {
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
      expect(result).toEqual([
        {
          id: 1,
          group_ids: [1],
          created_at: 1,
          name: 'item1',
          type: 'jpg',
        },
        {
          id: 2,
          group_ids: [1],
          created_at: 2,
          name: 'item2',
          type: 'png',
        },
        {
          id: 4,
          group_ids: [1],
          created_at: 3,
          name: 'item4',
          type: 'txt',
        },
      ]);
    });

    it('should return empty when not match', async () => {
      const result = await dao.queryItemsByGroupId(4);
      expect(result).toHaveLength(0);
    });
  });
});
