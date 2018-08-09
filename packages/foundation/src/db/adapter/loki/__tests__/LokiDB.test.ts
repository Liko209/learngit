/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-04-28 17:21:59
 * Copyright © RingCentral. All rights reserved.
 */
import LokiDB from '../LokiDB';
import LokiCollection from '../LokiCollection';
import { ISchema } from '../../../db';

// jest.mock('../LokiCollection');

const schema: ISchema = {
  name: 'Glip',
  version: 1,
  schema: {
    1: {
      person: { unique: '++id', indices: ['firstName', 'lastName'] },
      group: { unique: '++id' },
    },
  },
};

async function createOpenedDb() {
  const db = new LokiDB(schema);
  await db.open();
  return db;
}

describe('LokiDB', () => {
  let lokiDB: LokiDB;
  beforeEach(async () => {
    lokiDB = new LokiDB(schema);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await lokiDB.close();
  });

  describe('isOpen()', () => {
    it('should return wether the db is opened', () => {
      expect(lokiDB.isOpen()).toBeFalsy();
    });
  });

  describe('ensureDBOpened()', () => {
    it('should ensure db is opened', async () => {
      await lokiDB.ensureDBOpened();
      expect(lokiDB.isOpen()).toBeTruthy();
    });
  });

  describe('open()', () => {
    it('should open the db', async () => {
      await lokiDB.open();
      expect(lokiDB.isOpen()).toBeTruthy();
    });
  });

  describe('close()', () => {
    it('should close the db', async () => {
      const dexieDb2 = await createOpenedDb();
      await dexieDb2.close();
      expect(dexieDb2.isOpen()).toBeFalsy();
    });
  });

  describe('delete()', () => {
    it('should delete the db', async () => {
      const dexieDb2 = await createOpenedDb();
      await dexieDb2.delete();
      expect(dexieDb2.isOpen()).toBeFalsy();
    });
  });

  describe('getCollection()', () => {
    it('should return a collection', () => {
      const collection = lokiDB.getCollection('person');
      expect(collection).toBeInstanceOf(LokiCollection);
    });
  });

  describe('getTransaction()', () => {
    it('should run transaction', async () => {
      const collection = lokiDB.getCollection('person');
      const callback = jest.fn();
      await lokiDB.getTransaction('rw', [collection], callback);
      expect(callback).toHaveBeenCalled();
    });
  });
});
