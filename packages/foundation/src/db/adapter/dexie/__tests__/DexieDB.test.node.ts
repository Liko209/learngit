/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-04-28 17:21:59
 * Copyright © RingCentral. All rights reserved.
 */
import DexieDB from '../DexieDB';
import DexieCollection from '../DexieCollection';
import { ISchema } from '../../../db';
import { DexieTester } from './Setup';

const Dexie = require('dexie');

// jest.mock('../DexieCollection');
const upgrader = jest.fn();
const schema: ISchema = {
  name: 'Glip',
  schema: {
    1: {
      person: {
        unique: '++id',
        indices: ['firstName'],
      },
      group: { unique: '++id' },
    },
    2: {
      person: {
        unique: '++id',
        indices: ['firstName', 'lastName'],
        onUpgrade: upgrader,
      },
    },
  },
};

async function createOpenedDb() {
  const db = new DexieDB(schema);
  await db.open();
  return db;
}

describe.skip('DexieDb', () => {
  let dexieDb: DexieDB;
  beforeEach(async () => {
    DexieTester.setup();
    dexieDb = new DexieDB(schema);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await dexieDb.close();
  });

  describe('isOpen()', () => {
    it('should return wether the db is opened', () => {
      expect(dexieDb.isOpen()).toBeFalsy();
    });
  });

  describe('ensureDBOpened()', () => {
    it('should ensure db is opened', async () => {
      await dexieDb.ensureDBOpened();
      expect(dexieDb.isOpen()).toBeTruthy();
    });

    it('should not call db.open again if it is already opened', async () => {
      jest.spyOn(dexieDb.db, 'isOpen').mockReturnValue(true);
      jest.spyOn(dexieDb.db, 'open');
      await dexieDb.ensureDBOpened();
      expect(dexieDb.db.open).not.toHaveBeenCalled();
      jest.restoreAllMocks();
    });
  });

  describe('open()', () => {
    it('should open the db ', async () => {
      await dexieDb.open();
      expect(dexieDb.isOpen()).toBeTruthy();
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
      const collection = dexieDb.getCollection('person');
      expect(collection).toBeInstanceOf(DexieCollection);
    });
  });

  describe('getTransaction()', () => {
    it('should run transaction', async () => {
      const collection = dexieDb.getCollection('person');
      const callback = jest.fn();
      await dexieDb.getTransaction('rw', [collection], callback);
      expect(callback).toHaveBeenCalledTimes(1);
    });
    it('should run callback anyway', async () => {
      const callback = jest.fn();
      await dexieDb.getTransaction(undefined, undefined, callback);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
