/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-04-28 17:22:04
 * Copyright © RingCentral. All rights reserved.
 */

import DexieCollection from '../DexieCollection';
import {
  setupDexie,
  extractIds,
  extractFirstNames,
} from '../../__tests__/utils';
import DexieDB from '../DexieDB';
import { DatabaseKeyType } from '../../../db';
import { DexieTester } from './Setup';

type Item = {};

describe.skip('before set up', () => {
  it('primaryKeyName should be empty string', () => {
    DexieTester.setup();
    const dexie = new DexieDB({
      name: 'mock',
      schema: {
        1: {
          person: {
            unique: 'id',
          },
        },
      },
    });
    expect(dexie.getCollection('person').primaryKeyName()).toBe('id');
  });
});

describe.skip('DexieCollection', () => {
  let dexieCollection: DexieCollection<Item, DatabaseKeyType>;

  beforeEach(async () => {
    DexieTester.setup();
    ({ dexieCollection } = await setupDexie());
  });

  describe('getCollection()', () => {
    it('should return private field collection', () => {
      expect(dexieCollection.getCollection()).not.toBeFalsy();
    });
  });

  describe('primaryKeyName()', () => {
    it('should return primary key of the collection', () => {
      expect(dexieCollection.primaryKeyName()).toBe('id');
    });
  });

  describe('put()', () => {
    it('should put data into db', async () => {
      await dexieCollection.put({ id: 4 });
      expect(await dexieCollection.get(4)).toHaveProperty('id', 4);
    });

    it('should put data into db', async () => {
      await dexieCollection.put({ id: 'id', firstName: 'test' });
      expect(await dexieCollection.get('id')).toHaveProperty(
        'firstName',
        'test',
      );
    });
  });

  describe('delete()', () => {
    it('should delete data', async () => {
      await dexieCollection.delete(4);
      expect(await dexieCollection.get(4)).toBeNull();
    });

    it('should delete data', async () => {
      await dexieCollection.put({ id: 'id', firstName: 'test' });
      await dexieCollection.delete('id');
      expect(await dexieCollection.get('id')).toBeNull();
    });
  });

  describe('bulkDelete()', () => {
    it('should bulkDelete data', async () => {
      await dexieCollection.bulkDelete([1, 3]);
      expect(await dexieCollection.get(1)).toBeNull();
      expect(await dexieCollection.get(3)).toBeNull();
    });
  });

  describe('update()', () => {
    it('should update data', async () => {
      await dexieCollection.update(1, { firstName: 'Weilao' });
      expect(await dexieCollection.get(1)).toHaveProperty(
        'firstName',
        'Weilao',
      );
    });
  });

  describe('getAll()', () => {
    const emptyQuery = { criteria: [] };
    const sortByFirstName = (a: any, b: any) => {
      if (a.firstName > b.firstName) {
        return 1;
      }
      if (a.firstName === b.firstName) {
        return 0;
      }
      return -1;
    };

    it('should return all data in db', async () => {
      expect(extractIds(await dexieCollection.getAll())).toEqual([1, 2, 3, 4]);
    });

    it('should return data between the bounds', async () => {
      const result = await dexieCollection.getAll({
        criteria: [
          { key: 'id', name: 'between', lowerBound: 1, upperBound: 3 },
        ],
      });
      expect(extractIds(result)).toEqual([2]);
    });

    it('should sort by given function', async () => {
      const result = await dexieCollection.getAll(emptyQuery, {
        sortBy: sortByFirstName,
      });
      expect(extractFirstNames(result)).toEqual([
        'Alvin',
        'Baby',
        'Baby',
        'Cooler',
      ]);
    });

    it('should sort by given function desc combine', async () => {
      const result = await dexieCollection.getAll(emptyQuery, {
        sortBy: sortByFirstName,
        desc: true,
      });
      expect(extractFirstNames(result)).toEqual([
        'Cooler',
        'Baby',
        'Baby',
        'Alvin',
      ]);
    });

    it('should sort by given property', async () => {
      const result = await dexieCollection.getAll(emptyQuery, {
        sortBy: 'firstName',
      });
      expect(extractFirstNames(result)).toEqual([
        'Alvin',
        'Baby',
        'Baby',
        'Cooler',
      ]);
    });

    it('should sort by given property desc combine', async () => {
      const result = await dexieCollection.getAll(emptyQuery, {
        sortBy: 'firstName',
        desc: true,
      });
      expect(extractFirstNames(result)).toEqual([
        'Cooler',
        'Baby',
        'Baby',
        'Alvin',
      ]);
    });

    it('should sort by desc', async () => {
      const result = await dexieCollection.getAll(emptyQuery, {
        desc: true,
      });
      expect(extractIds(result)).toEqual([4, 3, 2, 1]);
    });

    it('should return [] when nothing matched', async () => {
      await dexieCollection.clear();
      const result = await dexieCollection.getAll();
      expect(extractIds(result)).toEqual([]);
    });

    it('should union parallel query response', async () => {
      const result = await dexieCollection.getAll({
        criteria: [{ key: 'id', name: 'equal', value: 1 }],
        parallel: [
          { criteria: [{ key: 'id', name: 'equal', value: 2 }] },
          { criteria: [{ key: 'id', name: 'equal', value: 3 }] },
        ],
      });
      expect(extractIds(result)).toEqual([1, 2, 3]);
    });
    it('should union and unique parallel query response', async () => {
      const result = await dexieCollection.getAll({
        criteria: [{ key: 'id', name: 'equal', value: 1 }],
        parallel: [
          { criteria: [{ key: 'id', name: 'equal', value: 1 }] },
          { criteria: [{ key: 'id', name: 'equal', value: 3 }] },
        ],
      });
      expect(extractIds(result)).toEqual([1, 3]);
    });
  });

  describe('count()', () => {
    it('should return total number of data in db', async () => {
      expect(await dexieCollection.count()).toEqual(4);
    });
    it('should return number of matched data in db when using parallel', async () => {
      expect(
        await dexieCollection.count({
          criteria: [{ key: 'id', name: 'equal', value: 1 }],
          parallel: [{ criteria: [{ key: 'id', name: 'equal', value: 2 }] }],
        }),
      ).toEqual(2);
    });
  });

  describe('first()', () => {
    it('should return first record in db', async () => {
      expect(await dexieCollection.first()).toHaveProperty('id', 1);
    });
  });

  describe('last()', () => {
    it('should return last record in db', async () => {
      expect(await dexieCollection.last()).toHaveProperty('id', 4);
    });
  });
});
