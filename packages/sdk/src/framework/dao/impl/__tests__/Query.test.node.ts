/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-03-05 13:30:00
 */

import { DBManager, IDatabase } from 'foundation/db';
import Query from '../Query';
import BaseDao from '../BaseDao';
import { randomItems } from './dummy';
import { IdModel } from '../../../model';

const Dexie = require('dexie');
// Create an IDBFactory at window.indexedDB so your code can use IndexedDB.
// Make IDBKeyRange global so your code can create key ranges.
Dexie.dependencies.indexedDB = require('fake-indexeddb');
Dexie.dependencies.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');

const faker = require('faker');
type NameObject = {
  firstName: string;
};

type RandomItem = {
  id: string;
  index: number | string;
  name: string;
  birthday: Date;
  pet: string;
  name2: NameObject;
  teams: number[];
};

class Dao<RandomItem extends IdModel<string>> extends BaseDao<
  RandomItem,
  string
> {
  constructor(db: IDatabase) {
    super('mock', db);
  }
}

const dbManager = new DBManager();
const schema = {
  name: 'DB',
  version: 1,
  schema: {
    1: {
      mock: {
        unique: 'id',
        indices: [
          'index',
          'name',
          'pet',
          '[index+name]',
          '[name+index]',
          '[id+index]',
          '[index+id]',
          '*teams',
        ],
      },
    },
  },
};

function isAscending(arr: any[]) {
  return arr.every((x, i) => i === 0 || x >= arr[i - 1]);
}

function isDescending(arr: any[]) {
  return arr.every((x, i) => i === 0 || x <= arr[i - 1]);
}

describe('Query', () => {
  let dao: BaseDao<RandomItem, string>;
  let query: Query<RandomItem, string>;

  beforeAll(async () => {
    dbManager.initDatabase(schema);
    dao = new Dao(dbManager.getDatabase());
  });

  beforeEach(() => {
    query = dao.createQuery();
  });

  afterEach(async () => {
    await dao.clear();
  });

  describe('basic', () => {
    it('count', async () => {
      await dao.bulkPut(randomItems(30, null));
      await expect(query.count()).resolves.toBe(30);
      await expect(query.toArray()).resolves.toHaveLength(30);
    });

    it('limit', async () => {
      await dao.bulkPut(randomItems(30));
      await expect(query.limit(10).count()).resolves.toBe(10);
      query.reset();
      await expect(query.limit(10).toArray()).resolves.toHaveLength(10);
      query.reset();
      await expect(query.limit(40).count()).resolves.toBe(30);
      query.reset();
      await expect(query.limit(40).toArray()).resolves.toHaveLength(30);
    });

    it('offset', async () => {
      await dao.bulkPut(randomItems(30));
      await expect(query.offset(10).count()).resolves.toBe(20);
      query.reset();
      await expect(query.offset(10).toArray()).resolves.toHaveLength(20);
    });

    it('offset + limit', async () => {
      await dao.bulkPut(randomItems(30));
      await expect(
        query
          .offset(10)
          .limit(10)
          .count(),
      ).resolves.toBe(10);
      query.reset();
      await expect(
        query
          .offset(10)
          .limit(10)
          .toArray(),
      ).resolves.toHaveLength(10);
    });
  });

  describe('orderBy', () => {
    beforeEach(async () => {
      await dao.bulkPut(
        randomItems(20, () => ({
          id: faker.random.uuid(),
          index: faker.random.number(100),
          name: faker.random.arrayElement([
            'David',
            'Eve',
            'Ryan',
            'Steve',
            'Ian',
          ]),
        })),
      );
    });

    it('orderByAsc', async () => {
      const result: RandomItem[] = await query.orderBy('index').toArray();
      expect(isAscending(result.map(item => item.index))).toBe(true);
    });

    it('orderByDesc', async () => {
      const result: RandomItem[] = await query.orderBy('index', true).toArray();
      expect(isDescending(result.map(item => item.index))).toBe(true);
    });

    // it('orderBy multiple error', async () => {
    //   await expect(
    //     query
    //       .orderBy('id', true)
    //       .orderBy('index')
    //       .toArray()
    //   ).rejects.toBeInstanceOf(Error);
    // });

    // it('orderByAsc multiple', async () => {
    //   const result = await query
    //     .orderBy('index')
    //     .orderBy('id')
    //     .toArray();
    //   expect(result).toEqual(_.sortBy(result, ['index', 'id']));
    // });

    // it('orderByDesc multiple', async () => {
    //   const result = await query
    //     .orderBy('index', true)
    //     .orderBy('id', true)
    //     .toArray();
    //   expect(result).toEqual(_.sortBy(result, ['index', 'id']).reverse());
    // });
  });

  describe('equals', () => {
    beforeEach(async () => {
      await dao.bulkPut(
        randomItems(10, () => ({
          id: faker.random.uuid(),
          index: faker.random.arrayElement([
            'one',
            'two',
            'three',
            'three',
            'three',
            'three',
            'four',
            'five',
          ]),
          name: faker.random.arrayElement(['David', 'Eve']),
        })),
      );
    });

    it('equals', async () => {
      const result = await query.equal('index', 'three').toArray();
      expect(result.every(item => item.index === 'three')).toBe(true);
    });

    it('equals ignoreCase', async () => {
      const result = await query.equal('index', 'THREE', true).toArray();
      expect(result.every(item => item.index === 'three')).toBe(true);
    });

    it('chained multiple equal', async () => {
      const result = await query
        .equal('index', 'three')
        .equal('name', 'David')
        .toArray();
      expect(
        result.every(item => item.index === 'three' && item.name === 'David'),
      ).toBe(true);
    });

    it('chained ignoreCase', async () => {
      const result = await query
        .equal('index', 'THREE', true)
        .equal('name', 'David')
        .toArray();
      expect(
        result.every(item => item.index === 'three' && item.name === 'David'),
      ).toBe(true);
    });

    it('after order', async () => {
      const result = await query
        .orderBy('id')
        .equal('index', 'three')
        .toArray();
      expect(isAscending(result.map(item => item.id))).toBe(true);
      expect(result.every(item => item.index === 'three')).toBe(true);
    });

    it('after order ignoreCase', async () => {
      const result = await query
        .orderBy('id')
        .equal('index', 'THREE', true)
        .toArray();
      expect(isAscending(result.map(item => item.id))).toBe(true);
      expect(result.every(item => item.index === 'three')).toBe(true);
    });
  });

  describe('not equals', () => {
    beforeEach(async () => {
      await dao.bulkPut(
        randomItems(30, () => ({
          id: faker.random.uuid(),
          index: faker.random.arrayElement([
            'one',
            'two',
            'three',
            'four',
            'five',
          ]),
          name: faker.random.arrayElement(['David', 'Eve']),
          pet: faker.random.arrayElement(['dog', 'cat']),
        })),
      );
    });

    it('not equals', async () => {
      const result = await query.notEqual('index', 'three').toArray();
      expect(result.every(item => item.index !== 'three')).toBe(true);
    });

    it('not equals multiple', async () => {
      const result = await query
        .notEqual('index', 'three')
        .notEqual('name', 'Eve')
        .toArray();

      expect(
        result.every(item => item.index !== 'three' && item.name !== 'Eve'),
      ).toBe(true);
    });

    it('chained not equal', async () => {
      const result = await query
        .equal('index', 'three')
        .notEqual('name', 'David')
        .toArray();

      expect(
        result.every(item => item.index === 'three' && item.name !== 'David'),
      ).toBe(true);
    });

    it('chained multiple not equal', async () => {
      const result = await query
        .equal('pet', 'dog')
        .notEqual('index', 'one')
        .notEqual('name', 'David')
        .toArray();

      expect(
        result.every(
          item =>
            item.pet === 'dog' && item.index !== 'one' && item.name !== 'David',
        ),
      ).toBe(true);
    });
  });

  describe('between', () => {
    beforeEach(async () => {
      await dao.bulkPut(
        randomItems(100, () => ({
          id: faker.random.uuid(),
          index: faker.random.arrayElement([20, 50, faker.random.number(100)]),
          name: faker.random.arrayElement(['David', 'Eve', 'Gary']),
        })),
      );
    });

    it('between', async () => {
      const result = await query
        .between('index', 20, 50, false, false)
        .toArray();
      expect(result.every(item => item.index > 20 && item.index < 50)).toBe(
        true,
      );
    });

    it('between include bounds', async () => {
      const result = await query.between('index', 20, 50, true, true).toArray();
      expect(result.every(item => item.index >= 20 && item.index <= 50)).toBe(
        true,
      );
    });

    it('chained between', async () => {
      let result = await query
        .equal('name', 'David')
        .between('index', 20, 50, false, false)
        .toArray();
      expect(result.every(item => item.index > 20 && item.index < 50)).toBe(
        true,
      );

      query.reset();
      result = await query
        .between('index', 20, 50, false, false)
        .equal('name', 'David')
        .toArray();

      expect(
        result.every(
          item => item.index > 20 && item.index < 50 && item.name === 'David',
        ),
      ).toBe(true);

      query.reset();

      result = await query
        .between('index', 20, 50, false, false)
        .between('name', 'D', 'E', false, false)
        .toArray();

      expect(
        result.every(
          item => item.index > 20 && item.index < 50 && item.name === 'David',
        ),
      ).toBe(true);

      query.reset();
      result = await query
        .between('index', 20, 50, false, false)
        .between('name', 'd', 'e', true, true)
        .toArray();

      expect(
        result.every(
          item => item.index > 20 && item.index < 50 && item.name === 'David',
        ),
      ).toBe(true);

      query.reset();
      result = await query
        .between('index', 20, 50, false, false)
        .between('name', 'd', 'e', true, false)
        .toArray();

      expect(
        result.every(
          item => item.index > 20 && item.index < 50 && item.name === 'David',
        ),
      ).toBe(true);

      query.reset();
      result = await query
        .between('index', 20, 50, false, false)
        .between('name', 'd', 'e', false, true)
        .toArray();

      expect(
        result.every(
          item => item.index > 20 && item.index < 50 && item.name === 'David',
        ),
      ).toBe(true);
    });
  });

  describe('greaterThan', () => {
    beforeEach(async () => {
      await dao.bulkPut(
        randomItems(100, () => ({
          id: faker.random.uuid(),
          index: faker.random.arrayElement([20, 50, faker.random.number(100)]),
          name: faker.random.arrayElement(['David', 'Eve']),
          birthday: faker.date.future(),
        })),
      );
    });

    it('greaterThan', async () => {
      const result = await query.greaterThan('index', 20).toArray();
      expect(result.every(item => item.index > 20)).toBe(true);
    });

    it('greaterThanOrEqual', async () => {
      const result = await query.greaterThanOrEqual('index', 20).toArray();
      expect(result.every(item => item.index >= 20)).toBe(true);
    });

    it('chained greaterThan', async () => {
      let result = await query
        .equal('name', 'David')
        .greaterThan('index', 20)
        .toArray();
      expect(
        result.every(item => item.index > 20 && item.name === 'David'),
      ).toBe(true);

      query.reset();
      result = await query
        .greaterThan('index', 20)
        .equal('name', 'David')
        .toArray();
      expect(
        result.every(item => item.index > 20 && item.name === 'David'),
      ).toBe(true);

      query.reset();
      result = await query
        .greaterThan('index', 20)
        .between('name', 'D', 'E', false, false)
        .toArray();
      expect(
        result.every(item => item.index > 20 && item.name === 'David'),
      ).toBe(true);

      query.reset();
      const pastDay = faker.date.past();
      result = await query
        .greaterThan('index', 20)
        .between('name', 'D', 'E', false, false)
        .greaterThan('birthday', pastDay)
        .toArray();

      expect(
        result.every(
          ({ index, name, birthday }) =>
            index > 20 && name < 'E' && name > 'D' && birthday > pastDay,
        ),
      ).toBe(true);
    });
  });

  describe('lessThan', () => {
    beforeEach(async () => {
      await dao.bulkPut(
        randomItems(100, () => ({
          id: faker.random.uuid(),
          index: faker.random.arrayElement([20, 50, faker.random.number(100)]),
          name: faker.random.arrayElement(['David', 'Eve']),
        })),
      );
    });

    it('lessThan', async () => {
      const result = await query.lessThan('index', 50).toArray();
      expect(result.every(item => item.index < 50)).toBe(true);
    });

    it('lessThanOrEqual', async () => {
      const result = await query.lessThanOrEqual('index', 50).toArray();
      expect(result.every(item => item.index <= 50)).toBe(true);
    });

    it('chained lessThan', async () => {
      let result = await query
        .equal('name', 'David')
        .lessThan('index', 50)
        .toArray();
      expect(
        result.every(item => item.index < 50 && item.name === 'David'),
      ).toBe(true);

      query.reset();
      result = await query
        .lessThan('index', 50)
        .equal('name', 'David')
        .toArray();
      expect(
        result.every(item => item.index < 50 && item.name === 'David'),
      ).toBe(true);

      query.reset();
      result = await query
        .lessThan('index', 50)
        .between('name', 'D', 'E', false, false)
        .toArray();
      expect(
        result.every(item => item.index < 50 && item.name === 'David'),
      ).toBe(true);
    });
  });

  describe('anyOf', () => {
    const allData = randomItems(20, () => ({
      id: faker.random.uuid(),
      index: faker.random.number(100),
      name: faker.random.arrayElement(['David', 'Eve', 'Ryan', 'Steve', 'Ian']),
    }));
    beforeEach(async () => {
      await dao.bulkPut(allData);
    });

    it('anyOf', async () => {
      const result = await query
        .anyOf('name', ['David', 'Eve', 'Ryan'])
        .toArray();

      expect(result.length).toEqual(
        allData.filter(item => ['David', 'Eve', 'Ryan'].includes(item.name))
          .length,
      );
      expect(
        result.every(item => ['David', 'Eve', 'Ryan'].includes(item.name)),
      ).toBe(true);
    });

    it('anyOf should be case-sensitive by default', async () => {
      const result = await query
        .anyOf('name', ['david', 'eve', 'ryan', 'steve', 'ian'])
        .toArray();
      expect(result.length).toBe(0);
    });

    it('anyOf ignore case', async () => {
      const result = await query
        .anyOf('name', ['david', 'eve', 'ryan'], true)
        .toArray();

      expect(result.length).toEqual(
        allData.filter(item => ['David', 'Eve', 'Ryan'].includes(item.name))
          .length,
      );

      expect(
        result.every(item => ['David', 'Eve', 'Ryan'].includes(item.name)),
      ).toBe(true);
    });

    it('chained anyOf', async () => {
      let result1 = await query
        .lessThan('index', 50)
        .anyOf('name', ['David', 'Eve', 'Ryan', 'Steve', 'Ian'])
        .toArray();

      query.reset();
      let result2 = await query.lessThan('index', 50).toArray();
      expect(result1.length).toEqual(result2.length);

      // ignore case
      query.reset();
      result1 = await query
        .lessThan('index', 50)
        .anyOf('name', ['david', 'eve', 'ryan', 'steve', 'ian'], true)
        .toArray();

      query.reset();
      result2 = await query.lessThan('index', 50).toArray();
      expect(result1.length).toEqual(result2.length);
    });
  });

  describe('contain', () => {
    const allData = randomItems(20, () => ({
      id: faker.random.uuid(),
      index: faker.random.number(100),
      teams: randomItems(5, () => faker.random.arrayElement([1, 2, 3, 4, 5])),
    }));
    beforeEach(async () => {
      await dao.bulkPut(allData);
    });

    it('contain', async () => {
      const result = await query.contain('teams', 1).toArray();
      expect(result.every(item => item.teams.includes(1))).toBe(true);
    });
  });

  describe('sort', () => {
    beforeEach(async () => {
      await dao.bulkPut(
        randomItems(20, () => ({
          id: faker.random.uuid(),
          index: faker.random.number(100),
          name: faker.random.arrayElement([
            'David',
            'Eve',
            'Ryan',
            'Steve',
            'Ian',
          ]),
        })),
      );
    });

    it('should be ascending by default', async () => {
      let result = await query.toArray({
        sortBy: 'index',
      });
      expect(isAscending(result.map(item => item.index))).toBe(true);

      query.reset();

      result = await query
        .anyOf('name', ['David', 'Eve', 'Ryan', 'Steve', 'Ian'])
        .toArray({
          sortBy: 'index',
        });
      expect(isAscending(result.map(item => item.index))).toBe(true);
    });

    it('should be descending', async () => {
      let result = await query.toArray({
        sortBy: 'index',
        desc: true,
      });
      expect(isDescending(result.map(item => item.index))).toBe(true);

      query.reset();

      result = await query
        .anyOf('name', ['David', 'Eve', 'Ryan', 'Steve', 'Ian'])
        .toArray({
          sortBy: 'index',
          desc: true,
        });

      expect(isDescending(result.map(item => item.index))).toBe(true);
    });

    it('descending without sortBy', async () => {
      await expect(
        query.greaterThan('index', 0).toArray({
          desc: true,
        }),
      ).rejects.toBeInstanceOf(Error);
    });
  });

  describe('filter', () => {
    beforeEach(async () => {
      await dao.bulkPut(
        randomItems(20, () => ({
          id: faker.random.uuid(),
          index: faker.random.number(100),
          name2: faker.random.arrayElement([
            { firstName: 'David' },
            { firstName: 'Eve' },
            { firstName: 'Ryan' },
            { firstName: 'Steve' },
            { firstName: 'Ian' },
          ]),
        })),
      );
    });

    it('filter out item where name.firstName equals David', async () => {
      const result = await query
        .filter((item: RandomItem) => item.name2.firstName === 'David')
        .toArray();

      expect(result.every(item => item.name2.firstName === 'David')).toBe(true);
    });
  });

  describe('first & last', () => {
    beforeEach(async () => {
      await dao.bulkPut(
        randomItems(20, () => ({
          id: faker.random.uuid(),
          index: faker.random.number(100),
          name: faker.random.arrayElement([
            'David',
            'Eve',
            'Ryan',
            'Steve',
            'Ian',
          ]),
        })),
      );
    });

    it('should get first element', async () => {
      const result = await query.first();
      const all = await query.toArray();
      expect(all[0].id).toEqual(result!.id);
    });

    it('should get last element', async () => {
      const result = await query.last();
      const all = await query.toArray();
      expect(all[all.length - 1].id).toEqual(result!.id);
    });
  });

  describe('startsWith', () => {
    beforeEach(async () => {
      await dao.bulkPut(
        randomItems(20, () => ({
          id: faker.random.uuid(),
          index: faker.random.number(100),
          name: faker.random.arrayElement([
            'David',
            'Devin',
            'Ryan',
            'Steve',
            'Ian',
          ]),
        })),
      );
    });

    it('find name starts with D', async () => {
      let result = await query.startsWith('name', 'D').toArray();
      expect(result.every(item => item.name.startsWith('D'))).toBe(true);

      query.reset();

      result = await query
        .greaterThan('index', 0)
        .startsWith('name', 'D')
        .toArray();
      expect(result.every(item => item.name.startsWith('D'))).toBe(true);
    });

    it('find name starts with D ignoreCase', async () => {
      let result = await query.startsWith('name', 'd', true).toArray();
      expect(result.every(item => item.name.startsWith('D'))).toBe(true);

      query.reset();

      result = await query
        .greaterThan('index', 0)
        .startsWith('name', 'd', true)
        .toArray();

      expect(result.every(item => item.name.startsWith('D'))).toBe(true);
    });
  });

  describe('or', () => {
    beforeEach(async () => {
      await dao.bulkPut(
        randomItems(20, () => ({
          id: faker.random.uuid(),
          index: faker.random.number(100),
          name: faker.random.arrayElement([
            'David',
            'Devin',
            'Ryan',
            'Steve',
            'Ian',
          ]),
        })),
      );
    });

    it('run parallel query', async () => {
      const result = await query
        .equal('name', 'David')
        .or(dao.createQuery().equal('name', 'Devin'))
        .or(dao.createQuery().equal('name', 'Ryan'))
        .toArray();

      expect(
        result.every(
          ({ name }) => name === 'David' || name === 'Devin' || name === 'Ryan',
        ),
      ).toBe(true);
    });
  });
});
