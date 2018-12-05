import Dexie, { IndexableTypeArrayReadonly } from 'dexie';

type CollectionTable = Dexie.Collection | Dexie.Table;

const isIEOrEdge =
  typeof navigator !== 'undefined' &&
  /(MSIE|Trident|Edge)/.test(navigator.userAgent);

function isDexieCollection(collection: any): collection is Dexie.Collection {
  return collection.and !== undefined;
}

const equalIgnoreCase = (a: string, b: string) =>
  a.toLowerCase() === b.toLowerCase();

const includesIgnoreCase = (arr: string[], a: string) =>
  arr.some(val => equalIgnoreCase(val, a));

const startsWithIgnoreCase = (val: string, a: string) =>
  val.toLowerCase().indexOf(a.toLowerCase()) === 0;

class CollectionWhereClause {
  private coll: Dexie.Collection;
  private key: string;

  constructor(coll: Dexie.Collection, key: string) {
    this.coll = coll;
    this.key = key;
  }
  anyOf(arr: IndexableTypeArrayReadonly): Dexie.Collection {
    return this.coll.filter(item => arr.includes(item[this.key]));
  }
  anyOfIgnoreCase(arr: string[]): Dexie.Collection {
    return this.coll.filter(item => includesIgnoreCase(arr, item[this.key]));
  }
  equals(val: any): Dexie.Collection {
    return this.coll.filter(
      item =>
        val === item[this.key] ||
        (Array.isArray(item[this.key]) && item[this.key].indexOf(val) >= 0),
    );
  }
  equalsIgnoreCase(val: string): Dexie.Collection {
    return this.coll.filter((item: any) =>
      equalIgnoreCase(item[this.key], val),
    );
  }
  notEqual(val: any): Dexie.Collection {
    return this.coll.filter((item: any) => val !== item[this.key]);
  }
  startsWith(val: string): Dexie.Collection {
    return this.coll.filter((item: any) => item[this.key].indexOf(val) === 0);
  }
  startsWithIgnoreCase(val: string): Dexie.Collection {
    return this.coll.filter((item: any) =>
      startsWithIgnoreCase(item[this.key], val),
    );
  }
  between(
    lower: any,
    upper: any,
    includeLower?: boolean,
    includeUpper?: boolean,
  ): Dexie.Collection {
    const key = this.key;
    return this.coll.filter((item: any) => {
      return !!(
        (lower < item[key] && item[key] < upper) ||
        (includeLower && lower === item[key]) ||
        (includeUpper && upper === item[key])
      );
    });
  }
  contains(val: any): Dexie.Collection {
    return this.coll.filter(
      (item: any) =>
        Array.isArray(item[this.key]) && item[this.key].indexOf(val) >= 0,
    );
  }
}

const collectionWhere = (coll: Dexie.Collection, key: string) => {
  return new CollectionWhereClause(coll, key);
};

export {
  CollectionTable,
  isDexieCollection,
  isIEOrEdge,
  CollectionWhereClause,
  collectionWhere,
};
