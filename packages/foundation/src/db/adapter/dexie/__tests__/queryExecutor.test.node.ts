import Dexie from 'dexie';
import { execQuery } from '../queryExecutor';
// import { DexieTester } from './Setup';
import {
  extractCollectionsToIds,
  extractCollectionsToFirstNames,
  setupDexie,
  extractCollections,
  IPerson,
} from '../../__tests__/utils';

Dexie.dependencies.indexedDB = require('fake-indexeddb');
Dexie.dependencies.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');

// Create an IDBFactory at window.indexedDB so your code can use IndexedDB.
// Make IDBKeyRange global so your code can create key ranges.

describe('execQuery<IPerson>()', () => {
  let table: Dexie.Table<IPerson>;

  beforeAll(async () => {
    ({ table } = await setupDexie());
  });

  describe('without criteria', () => {
    it('should return all data', async () => {
      const collections = await execQuery<IPerson>(table);

      const result = await extractCollectionsToIds(collections);

      expect(result).toEqual([1, 2, 3, 4]);
    });
  });

  describe('reverse', () => {
    it('should reverse the collection', async () => {
      const collections = await execQuery<IPerson>(table, {
        criteria: [{ name: 'reverse' }],
      });
      const result = await extractCollectionsToIds(collections);

      expect(result).toEqual([4, 3, 2, 1]);
    });

    it('should not reverse the collection when applying two reverse', async () => {
      const collections = await execQuery<IPerson>(table, {
        criteria: [{ name: 'reverse' }, { name: 'reverse' }],
      });

      const result = await extractCollectionsToIds(collections);

      expect(result).toEqual([1, 2, 3, 4]);
    });
  });

  describe('orderBy', () => {
    it('should order by given key', async () => {
      const collections = await execQuery<IPerson>(table, {
        criteria: [{ name: 'orderBy', key: 'firstName' }],
      });
      const result = await extractCollectionsToFirstNames(collections);
      expect(result).toEqual(['Alvin', 'Baby', 'Baby', 'Cooler']);
    });
    it('should order by given key desc', async () => {
      const collections = await execQuery<IPerson>(table, {
        criteria: [{ name: 'orderBy', key: 'firstName', desc: true }],
      });
      const result = await extractCollectionsToFirstNames(collections);
      expect(result).toEqual(['Cooler', 'Baby', 'Baby', 'Alvin']);
    });
  });

  describe('anyOf', () => {
    it('should return any of the data that matches given array', async () => {
      const collections = await execQuery<IPerson>(table, {
        criteria: [
          {
            key: 'firstName',
            name: 'anyOf',
            value: ['Alvin', 'cooler'],
            ignoreCase: true,
          },
        ],
      });
      const result = await extractCollectionsToFirstNames(collections);
      expect(result).toEqual(['Alvin', 'Cooler']);
    });

    it('should return any of the data that matches given array (not ignore case)', async () => {
      const collections = await execQuery<IPerson>(table, {
        criteria: [
          { key: 'firstName', name: 'anyOf', value: ['Alvin', 'cooler'] },
        ],
      });
      const result = await extractCollectionsToFirstNames(collections);
      expect(result).toEqual(['Alvin']);
    });
  });

  describe('equal', () => {
    it('should return strict matched data', async () => {
      const collections = await execQuery<IPerson>(table, {
        criteria: [
          {
            key: 'firstName',
            name: 'equal',
            value: 'cooler',
            ignoreCase: true,
          },
        ],
      });
      const result = await extractCollectionsToFirstNames(collections);
      expect(result).toEqual(['Cooler']);
    });

    it('should work with boolean', async () => {
      const collections = await execQuery<IPerson>(table, {
        criteria: [{ key: 'isVip', name: 'equal', value: true }],
      });
      const result = await extractCollectionsToIds(collections);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('notEqual', () => {
    it('should return strict matched data', async () => {
      const collections = await execQuery<IPerson>(table, {
        criteria: [{ key: 'firstName', name: 'notEqual', value: 'Baby' }],
      });
      const result = await extractCollectionsToFirstNames(collections);
      expect(result).toEqual(['Alvin', 'Cooler']);
    });
  });

  describe('startsWith', () => {
    it('should return strict matched data', async () => {
      const collections = await execQuery<IPerson>(table, {
        criteria: [
          {
            key: 'firstName',
            name: 'startsWith',
            value: 'C',
            ignoreCase: true,
          },
        ],
      });
      const result = await extractCollectionsToFirstNames(collections);
      expect(result).toEqual(['Cooler']);
    });

    it('should return strict matched data (not ignore case)', async () => {
      const collections = await execQuery<IPerson>(table, {
        criteria: [{ key: 'firstName', name: 'startsWith', value: 'C' }],
      });
      const result = await extractCollectionsToFirstNames(collections);
      expect(result).toEqual(['Cooler']);
    });
  });

  describe('contains', () => {
    it('should return strict matched data', async () => {
      const collections = await execQuery<IPerson>(table, {
        criteria: [{ key: 'groups', name: 'contain', value: 1 }],
      });
      const result = await extractCollectionsToFirstNames(collections);
      expect(result).toEqual(['Baby', 'Cooler']);
    });
  });

  describe('filter', () => {
    it('should filter data', async () => {
      const collections = await execQuery<IPerson>(table, {
        criteria: [{ name: 'filter', filter: obj => obj.id === 1 }],
      });
      const result = await extractCollectionsToIds(collections);
      expect(result).toEqual([1]);
    });
  });

  describe('compose', () => {
    it('should filter data', async () => {
      const collections = await execQuery<IPerson>(table, {
        criteria: [
          { name: 'orderBy', key: 'firstName' },
          { name: 'filter', filter: obj => obj.id === 1 || obj.id === 2 },
        ],
      });
      const result = await extractCollectionsToIds(collections);
      expect(result).toEqual([2, 1]);
    });

    it('should return data that matches all the rules', async () => {
      const collections = await execQuery<IPerson>(table, {
        criteria: [
          { name: 'equal', key: 'firstName', value: 'Baby' },
          { name: 'equal', key: 'lastName', value: 'Lin' },
        ],
      });
      const result = await extractCollections(collections);
      expect(result).toEqual([
        { id: 1, firstName: 'Baby', lastName: 'Lin', isVip: true, groups: [1] },
      ]);
    });
  });

  describe('offset/limit', () => {
    it('should the first two item', async () => {
      const collections = await execQuery<IPerson>(table, {
        criteria: [{ name: 'limit', value: 2 }],
      });
      const result = await extractCollectionsToIds(collections);
      expect(result).toEqual([1, 2]);
    });

    it('should the last two item', async () => {
      const collections = await execQuery<IPerson>(table, {
        criteria: [{ name: 'offset', value: 2 }],
      });
      const result = await extractCollectionsToIds(collections);
      expect(result).toEqual([3, 4]);
    });
  });
});
