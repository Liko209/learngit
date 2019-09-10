// import { IQuery } from './adapter/types';
export interface IQuery<T> {
  criteria: IQueryCriteria<T>[];
  parallel?: IQuery<T>[];
}

export type DatabaseKeyType = number | string;

export interface IDatabase {
  ensureDBOpened: () => Promise<void>;
  open: () => Promise<void>;
  isOpen: () => boolean;
  close: () => void;
  delete: () => Promise<void>;
  getCollection: <T extends object, Key extends DatabaseKeyType>(
    name: string,
  ) => IDatabaseCollection<T, Key>;
  getTransaction: (
    mode: string | void,
    collections: IDatabaseCollection<any, DatabaseKeyType>[] | void,
    callback: () => Promise<void>,
  ) => Promise<void>;
}

export interface IDatabaseCollection<T, Key extends DatabaseKeyType> {
  // private collection: any;
  // private table: any;
  primaryKeys(query?: IQuery<T>): Promise<Key[]>;
  primaryKeyName: () => string;
  put: (item: T) => Promise<void>;
  bulkPut: (array: T[]) => Promise<void>;
  get: (key: Key) => Promise<T | null>;
  delete: (key: Key) => Promise<void>;
  bulkDelete: (array: Key[]) => Promise<void>;
  update: (key: Key, changes: Partial<T>) => Promise<void>;
  clear: () => Promise<void>;
  getAll: (query?: IQuery<T>, queryOption?: IQueryOption) => Promise<T[]>;
  count: (query?: IQuery<T>) => Promise<number>;
  first: (query?: IQuery<T>) => Promise<T>;
  last: (query?: IQuery<T>) => Promise<T>;
}

export interface ITableSchemaDefinition {
  unique: string;
  indices?: string[];
  onUpgrade?: (item: any) => void;
}
export interface ISchemaDefinition {
  [tableName: string]: ITableSchemaDefinition;
}
export interface ISchemaVersions {
  [version: number]: ISchemaDefinition;
}

export interface ISchema {
  name: string;
  version: number;
  schema: ISchemaVersions;
}
export interface IQueryOption {
  sortBy?: ((a: any, b: any) => number) | string;
  desc?: boolean;
}

export interface IQueryCriteria<T> {
  name: string;
  value?: any;
  key?: string;
  desc?: boolean;
  lowerBound?: number | string;
  upperBound?: number | string;
  includeLower?: boolean;
  includeUpper?: boolean;
  ignoreCase?: boolean;
  array?: any[];
  filter?: IFilter<T>;
  amount?: number;
}
export interface IOrderBy {
  key: string;
  desc: boolean;
}

export interface INotEqual {
  key: string;
  value: any;
}

export interface IEqual {
  key: string;
  value: string;
  ignoreCase?: boolean;
}

export interface IAnyOf {
  key: string;
  array: any[];
  ignoreCase?: boolean;
}

export interface IStartsWith {
  key: string;
  value: string;
  ignoreCase: boolean;
}

export interface IRange {
  key: string;
  lower: any;
  upper: any;
  includeLower?: boolean;
  includeUpper?: boolean;
}

export interface IContain {
  key: string;
  value: string;
}

export interface IFilter<T> {
  (item: T): boolean;
}

export interface ICriteria<T> {
  offsets: number;
  limits: number;
  orderBys: IOrderBy[];
  desc: boolean;
  ranges: IRange[];
  equalRangeCount: number;
  equals: IEqual[];
  notEquals: INotEqual[];
  anyOfs: IAnyOf[];
  contains: IContain[];
  filters: IFilter<T>[];
  startsWiths: IStartsWith[];
  parallels: IQuery<T>[];
}

export interface IParsedSchema {
  unique: string;
  indices: string[];
  version: string;
  colName: string;
}

export interface IParseSchemeCallback {
  (value: IParsedSchema): void;
}

export interface ICriteriaParser<T> {
  parse(queryCriterias: IQueryCriteria<T>[]): ICriteria<T>;
}

export interface IStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: any): void;
  removeItem(key: string): void;
  clear(): void;
}
