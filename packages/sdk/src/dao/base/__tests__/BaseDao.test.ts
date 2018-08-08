/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-03-01 14:31:21
 */
import { DBManager, IDatabase } from 'foundation';
import BaseDao from '../BaseDao';
import Query from '../Query';

type RandomItem = {
  id?: number;
  name?: string;
  boolean?: boolean;
};
class Dao extends BaseDao<RandomItem> {
  constructor(db: IDatabase) {
    super('mock', db);
  }
}
const dbManager = new DBManager();
let dao: Dao;

describe('BaseDao', () => {
  beforeAll(async () => {
    await dbManager.initDatabase({
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
    });

    dao = new Dao(dbManager.getDatabase());
  });

  it('should successfully create new dao', () => {
    expect(dao).toHaveProperty('db', dbManager.getDatabase());
    expect(dao).toHaveProperty('collection');
  });

  it('should resolve null', async () => {
    await expect(dao.get(1)).resolves.toBeFalsy();
  });

  it('should throw error if put invalid', async () => {
    await expect(dao.put(null)).rejects.toThrow();
    await expect(dao.put({})).rejects.toThrow();
    await expect(dao.put({ name: 'hihi' })).rejects.toThrow();
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

  it('should call bulkPut if put receive array', async () => {
    jest.spyOn(dao, 'bulkPut');
    const data = [{ id: 2323, name: 'asfasf' }];
    await dao.put(data);
    expect(dao.bulkPut).toHaveBeenCalledWith(data);
    jest.restoreAllMocks();
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

  it('should update items', async () => {
    await dao.update([
      {
        id: 1,
        name: 'NAME1',
      },
      {
        id: 2,
        name: 'NAME2',
      },
    ]);
    await expect(dao.get(1)).resolves.toMatchObject({
      id: 1,
      name: 'NAME1',
      boolean: false,
    });
    await expect(dao.get(2)).resolves.toMatchObject({
      id: 2,
      name: 'NAME2',
      boolean: false,
    });
  });

  it('should put if updating item not exists', async () => {
    await dao.update([
      {
        id: -1,
        name: 'NAME1',
      },
    ]);
    await expect(dao.get(-1)).resolves.toMatchObject({
      id: -1,
      name: 'NAME1',
    });
  });

  it('should get all in table', async () => {
    await expect(dao.getAll()).resolves.toHaveLength(5);
  });

  it('should delete item', async () => {
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
});
