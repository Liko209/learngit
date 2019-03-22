/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */

import { setup } from '../../../../../../dao/__tests__/utils';
import { EventItemDao } from '../EventItemDao';

describe('Event Item Dao', () => {
  let dao: EventItemDao;

  beforeAll(() => {
    const { database } = setup();
    dao = new EventItemDao(database);
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
  });

  describe('toSanitizedItem', () => {
    function setUpData() {
      const eventItem: any = {
        id: 123123,
        created_at: 11231333,
        modified_at: 11231333,
        group_ids: [123],
        start: 111,
        end: 222,
        effective_end: 999,
        repeat: 1,
        repeat_ending: 'end',
        repeat_ending_after: 'after',
        repeat_ending_on: 123123,
        all_day: true,
        tz_id: ' Asia/Shanghai',
        description: 'des',
      };

      return { eventItem };
    }

    const { eventItem } = setUpData();
    it('should return sanitized item', () => {
      expect(dao.toSanitizedItem(eventItem)).toEqual({
        id: eventItem.id,
        group_ids: eventItem.group_ids,
        created_at: eventItem.created_at,
        modified_at: eventItem.modified_at,
        start: eventItem.start,
        end: eventItem.end,
        effective_end: eventItem.effective_end,
        repeat: eventItem.repeat,
        repeat_ending: eventItem.repeat_ending,
        repeat_ending_after: eventItem.repeat_ending_after,
        repeat_ending_on: eventItem.repeat_ending_on,
        all_day: eventItem.all_day,
      });
    });
  });

  describe('toPartialSanitizedItem', () => {
    const item = {
      id: 123123,
      created_at: 11231333,
      modified_at: 11231333,
      group_ids: [123],
      start: 111,
      end: 222,
      effective_end: 999,
      repeat: 1,
      repeat_ending: 'end',
      repeat_ending_after: 'after',
      repeat_ending_on: 12313,
      all_day: true,
      description: 'des',
      tz_id: ' Asia/Shanghai',
    };

    const itemResult = {
      id: 123123,
      created_at: 11231333,
      modified_at: 11231333,
      group_ids: [123],
      start: 111,
      end: 222,
      effective_end: 999,
      repeat: 1,
      repeat_ending: 'end',
      repeat_ending_after: 'after',
      repeat_ending_on: 12313,
      all_day: true,
    };

    it.each`
      partialItem | result        | comments
      ${item}     | ${itemResult} | ${'all properties'}
    `('should return object with $comments', ({ partialItem, result }) => {
      expect(dao.toPartialSanitizedItem(partialItem)).toEqual(result);
    });
  });
});
