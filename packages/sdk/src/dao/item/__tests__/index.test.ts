import ItemDao from '../';
import { setup } from '../../__tests__/utils';
import { Item } from '../../../models';
import { itemFactory } from '../../../__tests__/factories';

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

  it('getItemsByIds()', async () => {
    const items = [
      itemFactory.build({ id: 1 }),
      itemFactory.build({ id: 2 }),
      itemFactory.build({ id: 3 }),
      itemFactory.build({ id: 4 }),
    ];
    await itemDao.bulkPut(items);
    expect(itemDao.getItemsByIds([1, 2, 3, 4])).resolves.toEqual(items);
  });

  describe('getItemsByGroupId()', () => {
    const items: Item[] = [
      itemFactory.build({
        id: 1,
        group_ids: [123],
      }),
      itemFactory.build({
        id: 2,
        group_ids: [123, 444],
      }),
      itemFactory.build({
        id: 3,
        group_ids: [321],
      }),
      itemFactory.build({
        id: 4,
        group_ids: [321],
      }),
      itemFactory.build({
        id: 5,
        group_ids: [123],
      }),
    ];
    beforeEach(async () => {
      await itemDao.bulkPut(items);
    });
    it('no limit', async () => {
      expect(itemDao.getItemsByGroupId(123)).resolves.toMatchObject([
        {
          id: 1,
          group_ids: [123],
        },
        {
          id: 2,
          group_ids: [123, 444],
        },
        {
          id: 5,
          group_ids: [123],
        },
      ]);
    });

    it('with limit', async () => {
      expect(itemDao.getItemsByGroupId(123, 1)).resolves.toMatchObject([
        {
          id: 1,
          group_ids: [123],
        },
      ]);
    });
  });
});
