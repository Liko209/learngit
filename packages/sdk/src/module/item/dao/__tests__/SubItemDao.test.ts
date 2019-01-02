/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */

import { setup } from '../../../../dao/__tests__/utils';
import { SubItemDao } from '../SubItemDao';
import { EventItemDao } from '../EventItemDao';
import { SanitizedEventItem } from '../../entity';

describe('Event Item Dao', () => {
  let dao: SubItemDao<SanitizedEventItem>;

  beforeAll(() => {
    const { database } = setup();
    dao = new SubItemDao<SanitizedEventItem>(
      EventItemDao.COLLECTION_NAME,
      database,
    );
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

    it('Query older posts by group Id and post id', async () => {
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
  });
});
