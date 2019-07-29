/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */

import { setup } from '../../../../../../dao/__tests__/utils';
import { TaskItemDao } from '../TaskItemDao';

describe('Event Item Dao', () => {
  let dao: TaskItemDao;

  beforeAll(() => {
    const { database } = setup();
    dao = new TaskItemDao(database);
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

  describe('toSanitizedItem', () => {
    beforeAll(async () => {
      await dao.clear();
    });

    function setUpData() {
      const taskItem = {
        id: 123123,
        created_at: 11231333,
        group_ids: [123],
        due: 999,
        assigned_to_ids: [1, 2],
        section: 'sec',
        color: '#1231',
        complete: true,
      };

      return { taskItem };
    }

    const { taskItem } = setUpData();
    it('should return sanitized item', () => {
      expect(dao.toSanitizedItem(taskItem)).toEqual({
        id: taskItem.id,
        group_ids: taskItem.group_ids,
        created_at: taskItem.created_at,
        complete: taskItem.complete,
        due: taskItem.due,
        assigned_to_ids: taskItem.assigned_to_ids,
        color: taskItem.color,
      });
    });
  });

  describe('toPartialSanitizedItem', () => {
    const item = {
      id: 123123,
      created_at: 11231333,
      group_ids: [123],
      due: 999,
      assigned_to_ids: [1, 2],
      section: 'sec',
      color: '#1231',
      complete: true,
      gg: 'gg',
    };

    const itemResult = {
      id: 123123,
      created_at: 11231333,
      group_ids: [123],
      due: 999,
      assigned_to_ids: [1, 2],
      color: '#1231',
      complete: true,
    };

    it.each`
      partialItem | result        | comments
      ${item}     | ${itemResult} | ${'all properties'}
    `(' should return object $comments', ({ partialItem, result }) => {
      expect(dao.toPartialSanitizedItem(partialItem)).toEqual(result);
    });
  });
});
