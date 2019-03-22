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
      modified_at: 1,
      name: 'item1',
      type: 'jpg',
    },
    {
      id: 2,
      group_ids: [1],
      created_at: 2,
      modified_at: 2,
      name: 'item2',
      type: 'png',
    },
    {
      id: 3,
      group_ids: [2],
      created_at: 3,
      modified_at: 3,
      name: 'item3',
      type: 'exe',
    },
    {
      id: 4,
      group_ids: [1],
      created_at: 3,
      modified_at: 3,
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
          modified_at: 1,
          name: 'item1',
          type: 'jpg',
        },
        {
          id: 2,
          group_ids: [1],
          created_at: 2,
          modified_at: 2,
          name: 'item2',
          type: 'png',
        },
        {
          id: 4,
          group_ids: [1],
          created_at: 3,
          modified_at: 3,
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

  describe('toSanitizedItem', () => {
    function setUpData() {
      const fileItem = {
        company_id: 139265,
        created_at: 1546857116347,
        creator_id: 7307267,
        deactivated: false,
        function_id: 'file',
        group_ids: [842096646],
        id: 536412170,
        is_new: false,
        model_size: 0,
        modified_at: 1546857116623,
        name: '人月神话（CN）.pdf',
        post_ids: [3361800196],
        source: 'upload',
        type: 'application/pdf',
        type_id: 10,
        version: 2271038454890496,
        versions: [],
      };
      return {
        fileItem,
      };
    }

    const { fileItem } = setUpData();
    it('should return sanitized item', () => {
      expect(dao.toSanitizedItem(fileItem)).toEqual({
        id: fileItem.id,
        group_ids: fileItem.group_ids,
        created_at: fileItem.created_at,
        modified_at: fileItem.modified_at,
        name: fileItem.name,
        type: fileItem.type,
      });
    });
  });

  describe('toPartialSanitizedItem', () => {
    const item = {
      company_id: 139265,
      created_at: 1546857116347,
      creator_id: 7307267,
      deactivated: false,
      function_id: 'file',
      group_ids: [842096646],
      id: 536412170,
      is_new: false,
      model_size: 0,
      modified_at: 1546857116623,
      name: '人月神话（CN）.pdf',
      post_ids: [3361800196],
      source: 'upload',
      type: 'application/pdf',
      type_id: 10,
      version: 2271038454890496,
      versions: [],
    };

    const itemResult = {
      id: 536412170,
      created_at: 1546857116347,
      modified_at: 1546857116623,
      group_ids: [842096646],
      name: '人月神话（CN）.pdf',
      type: 'application/pdf',
    };

    it.each`
      partialItem | result        | comments
      ${item}     | ${itemResult} | ${'all properties'}
    `(' should return object $comments', ({ partialItem, result }) => {
      expect(dao.toPartialSanitizedItem(partialItem)).toEqual(result);
    });
  });
});
