/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-03-01 14:31:21
 * Copyright © RingCentral. All rights reserved.
 */
import { DBManager, IDatabase, DatabaseType } from 'foundation/db';
import BaseDao from '../BaseDao';
import Query from '../Query';

type RandomItem = {
  id: number;
  name?: string;
  boolean?: boolean;
};
class Dao extends BaseDao<RandomItem> {
  constructor(db: IDatabase) {
    super('mock', db);
  }
}

describe('BaseDao', () => {
  let dbManager: DBManager;
  let dao: Dao;

  async function fillData() {
    await dao.bulkPut([
      {
        id: 1,
        name: 'name1',
        boolean: false,
      },
      {
        id: 2,
        name: 'name2',
        boolean: false,
      },
      {
        id: 3,
        name: 'name3',
        boolean: false,
      },
    ]);
  }
  beforeEach(async () => {
    dbManager = new DBManager();
    await dbManager.initDatabase(
      {
        name: 'DB',
        version: 1,
        schema: {
          1: {
            mock: {
              unique: 'id',
              indices: [],
            },
          },
        },
      },
      DatabaseType.LokiDB,
    );

    dao = new Dao(dbManager.getDatabase());
  });

  it('should successfully create new dao', () => {
    expect(dao).toHaveProperty('db', dbManager.getDatabase());
    expect(dao).toHaveProperty('collection');
  });

  it('should resolve null', async () => {
    await expect(dao.get(1)).resolves.toBeFalsy();
  });

  it('should put new item', async () => {
    await dao.put({
      id: 1,
      name: 'name1',
      boolean: true,
    });

    await expect(dao.get(1)).resolves.toMatchObject({
      id: 1,
      name: 'name1',
      boolean: true,
    });
  });

  it('should bulkPut items', async () => {
    await dao.bulkPut([
      {
        id: 1,
        name: 'name1',
        boolean: false,
      },
      {
        id: 2,
        name: 'name2',
        boolean: false,
      },
      {
        id: 3,
        name: 'name3',
        boolean: false,
      },
    ]);

    await expect(dao.get(1)).resolves.toMatchObject({
      id: 1,
      name: 'name1',
      boolean: false,
    });
    await expect(dao.get(2)).resolves.toMatchObject({
      id: 2,
      name: 'name2',
      boolean: false,
    });
    await expect(dao.get(3)).resolves.toMatchObject({
      id: 3,
      name: 'name3',
      boolean: false,
    });
  });

  it('should batch get all items', async () => {
    await dao.bulkPut([
      {
        id: 1,
        name: 'name1',
        boolean: false,
      },
      {
        id: 2,
        name: 'name2',
        boolean: false,
      },
      {
        id: 3,
        name: 'name3',
        boolean: false,
      },
    ]);

    const result = await dao.batchGet([1, 2, 3]);
    expect(result.length).toBe(3);
  });

  it('should batch get one of item', async () => {
    await fillData();

    const result = await dao.batchGet([2]);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('name2');
    expect(result[0].boolean).toBe(false);
  });

  it('should batch get none of item', async () => {
    await fillData();

    const result = await dao.batchGet([4]);
    expect(result.length).toBe(0);
  });

  it('should batch get some of item', async () => {
    await fillData();

    const result = await dao.batchGet([1, 4]);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('name1');
    expect(result[0].boolean).toBe(false);
  });

  it('should skip null item when call batchGet', async () => {
    const testItems = [
      {
        id: 1,
        name: 'name1',
        boolean: false,
      },
      {
        id: 2,
        name: 'name2',
        boolean: false,
      },
    ];

    await dao.bulkPut(testItems);

    const result = await dao.batchGet([1, 2, 4], true);
    expect(result.length).toBe(2);
    expect(result).toEqual(testItems);
  });

  it('should return correctly result even has invalid ids', async () => {
    await dao.bulkPut([
      {
        id: 1,
        name: 'name1',
        boolean: false,
      },
      {
        id: 2,
        name: 'name2',
        boolean: false,
      },
      {
        id: 3,
        name: 'name3',
        boolean: true,
      },
    ]);

    const result = await dao.batchGet([1, null, 3, undefined]);
    expect(result.length).toBe(2);
    expect(result[0].name).toBe('name1');
    expect(result[1].name).toBe('name3');
    expect(result[0].boolean).toBe(false);
    expect(result[1].boolean).toBe(true);
  });

  it('should return [] if has not valid ids', async () => {
    const result = await dao.batchGet([null, undefined]);
    expect(result.length).toBe(0);
  });

  it('should put if updating item not exists', async () => {
    await dao.update({
      id: -1,
      name: 'NAME1',
    });
    await expect(dao.get(-1)).resolves.toMatchObject({
      id: -1,
      name: 'NAME1',
    });
  });

  it('should get all in table', async () => {
    await fillData();
    await expect(dao.getAll()).resolves.toHaveLength(3);
  });

  it('should delete item', async () => {
    await fillData();
    await expect(dao.get(3)).resolves.not.toBeFalsy();
    await dao.delete(3);
    await expect(dao.get(3)).resolves.toBeFalsy();
  });

  it('should delete items', async () => {
    await dao.bulkDelete([1, 2, 3]);
    await expect(dao.get(1)).resolves.toBeFalsy();
    await expect(dao.get(2)).resolves.toBeFalsy();
    await expect(dao.get(3)).resolves.toBeFalsy();
  });

  it('should clear all items', async () => {
    await dao.clear();
    await expect(dao.getAll()).resolves.toHaveLength(0);
  });

  it('should get new query object', () => {
    expect(dao.createQuery()).toBeInstanceOf(Query);
    expect(dao.createQuery().criteria).toEqual([]);
  });

  it('do in transaction', async () => {
    dao.doInTransaction(async () => {
      await dao.put({ id: 1000, name: 'transaction' });
      const result = await dao.get(1000);
      expect(result).not.toBeNull();
      expect((result as RandomItem).name).toBe('transaction');
    });
  });

  describe('update and bulk update', () => {
    beforeEach(async () => {
      await fillData();
    });

    it('should update item', async () => {
      await dao.update({
        id: 1,
        name: 'NAME1',
      });
      await expect(dao.get(1)).resolves.toMatchObject({
        id: 1,
        name: 'NAME1',
        boolean: false,
      });
    });

    it('should bulk update items', async () => {
      await expect(dao.get(1)).resolves.toEqual({
        id: 1,
        name: 'name1',
        boolean: false,
      });

      await dao.bulkUpdate([
        {
          id: 1,
          name: 'NAME1',
        },
      ]);

      const item = await dao.get(1);
      expect(item).toEqual({
        id: 1,
        name: 'NAME1',
        boolean: false,
      });
    });

    it('should not do put when update a not exist item and set not do put', async () => {
      await dao.bulkUpdate(
        [
          {
            id: 11,
            name: 'NAME1',
          },
        ],
        false,
      );
      await expect(dao.get(11)).resolves.toEqual(null);
    });
  });
});
