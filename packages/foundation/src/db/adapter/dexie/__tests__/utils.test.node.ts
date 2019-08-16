import Dexie from 'dexie';
import { CollectionWhereClause } from '../utils';
import {
  setupDexie,
  extractCollectionToFirstName,
  extractCollectionToIds,
} from '../../__tests__/utils';
import { DexieTester } from './Setup';

describe.skip('CollectionWhereClause', () => {
  let table: Dexie.Table;
  let coll: Dexie.Collection;
  let whereClause: CollectionWhereClause;

  beforeEach(async () => {
    DexieTester.setup();
    ({ table } = await setupDexie());
    coll = table.toCollection();
    whereClause = new CollectionWhereClause(coll, 'firstName');
  });

  describe('anyOf()', () => {
    it('should return matched data', async () => {
      const collection = whereClause.anyOf(['Alvin', 'Cooler']);
      expect(await extractCollectionToFirstName(collection)).toEqual([
        'Alvin',
        'Cooler',
      ]);
    });
  });

  describe('anyOfIgnoreCase()', () => {
    it('should return matched data (ignore case)', async () => {
      const collection = whereClause.anyOfIgnoreCase(['alvin', 'cooler']);
      expect(await extractCollectionToFirstName(collection)).toEqual([
        'Alvin',
        'Cooler',
      ]);
    });
  });

  describe('equals()', () => {
    it('should return matched data', async () => {
      const collection = whereClause.equals('Alvin');
      expect(await extractCollectionToFirstName(collection)).toEqual(['Alvin']);
    });
  });

  describe('equalsIgnoreCase()', () => {
    it('should return matched data (ignore case)', async () => {
      const collection = whereClause.equalsIgnoreCase('alvin');
      expect(await extractCollectionToFirstName(collection)).toEqual(['Alvin']);
    });
  });

  describe('notEqual()', () => {
    it('should return matched data (ignore case)', async () => {
      const collection = whereClause.notEqual('Baby');
      expect(await extractCollectionToFirstName(collection)).toEqual([
        'Alvin',
        'Cooler',
      ]);
    });
  });

  describe('startsWith()', () => {
    it('should return matched data', async () => {
      const collection = whereClause.startsWith('Ba');
      expect(await extractCollectionToFirstName(collection)).toEqual([
        'Baby',
        'Baby',
      ]);
    });
  });

  describe('startsWithIgnoreCase()', () => {
    it('should return matched data (ignore case)', async () => {
      const collection = whereClause.startsWithIgnoreCase('bA');
      expect(await extractCollectionToFirstName(collection)).toEqual([
        'Baby',
        'Baby',
      ]);
    });
  });

  describe('between()', () => {
    it('should return matched data', async () => {
      const collection = new CollectionWhereClause(coll, 'id').between(1, 3);
      expect(await extractCollectionToIds(collection)).toEqual([2]);
    });

    it('should return matched data include bounds', async () => {
      const collection = new CollectionWhereClause(coll, 'id').between(
        1, // upper
        3, // lower
        true, // includeLower
        true, // includeUpper
      );
      expect(await extractCollectionToIds(collection)).toEqual([1, 2, 3]);
    });
  });

  describe('contains()', () => {
    it('should return matched data', async () => {
      const collection = new CollectionWhereClause(coll, 'groups').contains(1);
      expect(await extractCollectionToFirstName(collection)).toEqual([
        'Baby',
        'Cooler',
      ]);
    });
  });
});
