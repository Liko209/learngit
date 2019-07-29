/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-04-28 17:22:04
 * Copyright © RingCentral. All rights reserved.
 */
import Loki from 'lokijs';
import LokiCollection from '../LokiCollection';
import { parseSchema } from '../../utils';
import { extractIds, extractFirstNames } from '../../__tests__/utils';
import { IParsedSchema, ISchema } from '../../../db';

interface IPerson {
  id: number | string;
  firstName?: string;
  lastName?: string;
}

const schema: ISchema = {
  name: 'Glip',
  schema: {
    1: {
      person: { unique: '++id', indices: ['firstName', 'lastName'] },
      group: { unique: '++id' },
    },
  },
};
const persons: IPerson[] = [
  { id: 1, firstName: 'Baby', lastName: 'Lin' },
  { id: 2, firstName: 'Alvin', lastName: 'Wang' },
  { id: 3, firstName: 'Cooler', lastName: 'Huang' },
  { id: 4, firstName: 'Baby', lastName: 'Huang' },
];

const setupLoki = async () => {
  const loki = new Loki('memory.db');
  parseSchema(schema.schema, ({ unique, indices, colName }: IParsedSchema) => {
    loki.addCollection('person', {
      indices,
      disableMeta: true,
      unique: [unique],
    });
  });
  const lokiCollection: LokiCollection<IPerson> = new LokiCollection(
    loki,
    'person',
  );
  await lokiCollection.bulkPut(persons);
  return { loki, lokiCollection };
};

describe('LokiCollection', () => {
  let lokiCollection: LokiCollection<IPerson>;

  beforeEach(async () => {
    ({ lokiCollection } = await setupLoki());
  });

  describe('primaryKeyName()', () => {
    it('should return primary key of the collection', () => {
      expect(lokiCollection.primaryKeyName()).toBe('id');
    });
  });

  describe('put()', () => {
    it('should put data into db', async () => {
      await lokiCollection.put({ id: 4 });
      expect(await lokiCollection.get(4)).toHaveProperty('id', 4);
    });

    it('should put data into db', async () => {
      await lokiCollection.put({ id: 'id', firstName: 'test' });
      expect(await lokiCollection.get('id')).toHaveProperty(
        'firstName',
        'test',
      );
    });
  });

  describe('delete()', () => {
    it('should delete data', async () => {
      await lokiCollection.delete(4);
      expect(await lokiCollection.get(4)).toBeNull();
    });

    it('should delete data', async () => {
      await lokiCollection.put({ id: 'id', firstName: 'test' });
      await lokiCollection.delete('id');
      expect(await lokiCollection.get('id')).toBeNull();
    });
  });

  describe('bulkDelete()', () => {
    it('should bulkDelete data', async () => {
      await lokiCollection.bulkDelete([1, 3]);
      expect(await lokiCollection.get(1)).toBeNull();
      expect(await lokiCollection.get(3)).toBeNull();
    });
  });

  describe('update()', () => {
    it('should update data', async () => {
      await lokiCollection.update(1, { firstName: 'Weilao' });
      expect(await lokiCollection.get(1)).toEqual({
        id: 1,
        firstName: 'Weilao',
        lastName: 'Lin',
      });
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
      expect(extractIds(await lokiCollection.getAll())).toEqual([1, 2, 3, 4]);
    });

    it('should return data between the bounds', async () => {
      const result = await lokiCollection.getAll({
        criteria: [
          { key: 'id', name: 'between', lowerBound: 1, upperBound: 3 },
        ],
      });
      expect(extractIds(result)).toEqual([2]);
    });

    it('should sort by given function', async () => {
      const result = await lokiCollection.getAll(emptyQuery, {
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
      const result = await lokiCollection.getAll(emptyQuery, {
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
      const result = await lokiCollection.getAll(emptyQuery, {
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
      const result = await lokiCollection.getAll(emptyQuery, {
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
      const result = await lokiCollection.getAll(emptyQuery, {
        desc: true,
      });
      expect(extractIds(result)).toEqual([4, 3, 2, 1]);
    });

    it('should return [] when nothing matched', async () => {
      await lokiCollection.clear();
      const result = await lokiCollection.getAll();
      expect(extractIds(result)).toEqual([]);
    });

    it('should union parallel query response', async () => {
      const result = await lokiCollection.getAll({
        criteria: [{ key: 'id', name: 'equal', value: 1 }],
        parallel: [
          { criteria: [{ key: 'id', name: 'equal', value: 2 }] },
          { criteria: [{ key: 'id', name: 'equal', value: 3 }] },
        ],
      });
      expect(extractIds(result)).toEqual([1, 2, 3]);
    });

    it('should union and unique parallel query response', async () => {
      const result = await lokiCollection.getAll({
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
      expect(await lokiCollection.count()).toEqual(4);
    });
  });

  describe('first()', () => {
    it('should return first record in db', async () => {
      expect(await lokiCollection.first()).toHaveProperty('id', 1);
    });
  });

  describe('last()', () => {
    it('should return last record in db', async () => {
      expect(await lokiCollection.last()).toHaveProperty('id', 4);
    });
  });
});
