/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-21 14:58:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ItemDao } from '../';
import { setup } from '../../../../dao/__tests__/utils';
import { Item } from '../../entity';
import { itemFactory } from '../../../../__tests__/factories';

describe('Item Dao', () => {
  let itemDao: ItemDao;

  beforeAll(() => {
    const { database } = setup();
    itemDao = new ItemDao(database);
  });

  afterEach(async () => {
    await itemDao.clear();
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
      const { database } = setup();
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
      const { database } = setup();
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
});
