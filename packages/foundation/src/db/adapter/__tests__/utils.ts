import Dexie from 'dexie';
import DexieCollection from '../dexie/DexieCollection';
import { isDexieCollection } from '../dexie/utils';
import LokiDB from '../loki/LokiDB';
import { ISchema, DatabaseKeyType } from '../../db';

interface IPerson {
  id: number;
  firstName: string;
  lastName: string;
  isVip: boolean;
  groups: number[];
}

const dexiePersonGroupSchema = {
  person: '++id, firstName, lastName, *groups',
  group: '++id',
};

const personGroupSchema = {
  person: { unique: '++id', indices: ['firstName', 'lastName'] },
  group: { unique: '++id' },
};

const schema: ISchema = {
  name: 'Glip',
  version: 1,
  schema: {
    1: personGroupSchema,
  },
};

const persons: IPerson[] = [
  { id: 1, firstName: 'Baby', lastName: 'Lin', isVip: true, groups: [1] },
  { id: 2, firstName: 'Alvin', lastName: 'Wang', isVip: true, groups: [] },
  {
    id: 3,
    firstName: 'Cooler',
    lastName: 'Huang',
    isVip: true,
    groups: [1, 2, 3],
  },
  { id: 4, firstName: 'Baby', lastName: 'Huang', isVip: false, groups: [2] },
];

const extractId = (obj: any) => obj.id;
const extractIds = (arr: any[]) => arr.map(extractId);
const extractFirstName = (obj: any) => obj.firstName;
const extractFirstNames = (arr: any[]) => arr.map(extractFirstName);

//
// Dexie
//
const setupDexie = async () => {
  const dexie: Dexie = new Dexie('Fiji');
  dexie.version(1).stores(dexiePersonGroupSchema);
  const table: Dexie.Table = dexie.table('person');
  const collection = table.toCollection();
  const dexieCollection: DexieCollection<
    IPerson,
    DatabaseKeyType
  > = new DexieCollection(dexie, 'person');
  await dexieCollection.clear();
  await dexieCollection.bulkPut(persons);

  return {
    dexie,
    table,
    collection,
    dexieCollection,
    persons,
    personGroupSchema,
  };
};
const extractCollection = async (col: any) => {
  const result: object[] = [];
  if (isDexieCollection(col)) {
    await col.each((item: object) => {
      result.push(item);
    });
  }
  return result;
};
const extractCollections = async (collections: any[]) => {
  let result: any[] = [];
  await Promise.all(
    collections.map(async (col) => {
      const arr = await extractCollection(col);
      result = result.concat(arr);
    }),
  );
  return result;
};
const extractCollectionToIds = async (col: any) => {
  const arr = await extractCollection(col);
  return extractIds(arr);
};
const extractCollectionsToIds = async (collections: any[]) => {
  const arr = await extractCollections(collections);
  return extractIds(arr);
};
const extractCollectionToFirstName = async (col: any) => {
  const arr = await extractCollection(col);
  return extractFirstNames(arr);
};
const extractCollectionsToFirstNames = async (col: any) => {
  const arr = await extractCollections(col);
  return extractFirstNames(arr);
};

//
// Loki
//
const setupLoki = async () => {
  const lokiDB = new LokiDB(schema);
  const lokiCollection = lokiDB.getCollection<IPerson, DatabaseKeyType>(
    'person',
  );
  const collection = lokiCollection.getCollection();
  await lokiCollection.clear();
  await lokiCollection.bulkPut(persons);
  return { lokiDB, lokiCollection, collection };
};
const extractLokiResultSets = (resultSets: any[]) => {
  const results: any[] = [];
  resultSets.forEach((resultSet) => {
    results.push(...resultSet.data({ removeMeta: true }));
  });
  return results;
};
const extractLokiResultSetToIds = (resultSets: any[]) => {
  const arr = extractLokiResultSets(resultSets);
  return extractIds(arr);
};
const extractLokiResultSetToFirstNames = async (col: any) => {
  const arr = await extractLokiResultSets(col);
  return extractFirstNames(arr);
};

export {
  // Common
  IPerson,
  extractId,
  extractIds,
  extractFirstName,
  extractFirstNames,
  // Dexie
  setupDexie,
  extractCollection,
  extractCollections,
  extractCollectionToIds,
  extractCollectionsToIds,
  extractCollectionToFirstName,
  extractCollectionsToFirstNames,
  // Loki
  setupLoki,
  extractLokiResultSets,
  extractLokiResultSetToIds,
  extractLokiResultSetToFirstNames,
};
