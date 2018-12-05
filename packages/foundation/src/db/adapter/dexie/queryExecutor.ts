/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-04-10 14:28:49
 * Copyright © RingCentral. All rights reserved.
 */
import Dexie from 'dexie';
import CriteriaParser from '../CriteriaParser';
import { collectionWhere } from './utils';
import {
  IQuery,
  IAnyOf,
  IEqual,
  IRange,
  INotEqual,
  IContain,
  IStartsWith,
  IFilter,
} from '../../db';

const execQuery = <T extends {}>(
  table: Dexie.Table,
  query: IQuery<T> = { criteria: [], parallel: [] },
): Dexie.Collection[] => {
  if (query.criteria.length === 0) {
    return [table.toCollection()];
  }

  let coll: Dexie.Collection | undefined;

  const {
    offsets,
    limits,
    orderBys,
    ranges,
    equals,
    notEquals,
    anyOfs,
    contains,
    filters,
    startsWiths,
    desc,
  } = new CriteriaParser<T>().parse(query.criteria);

  // TODO multi orderBy
  const orderBy = orderBys[0];
  if (orderBy) {
    coll = table.orderBy(orderBy.key);
    if (orderBy.desc) {
      coll.reverse();
    }
  }

  const where = (key: string) =>
    coll ? collectionWhere(coll, key) : table.where(key);

  anyOfs.forEach(({ key, array, ignoreCase }: IAnyOf) => {
    coll = ignoreCase
      ? where(key).anyOfIgnoreCase(array)
      : where(key).anyOf(array);
  });

  equals.forEach(({ key, value, ignoreCase }: IEqual) => {
    if (typeof value === 'boolean') {
      // Indexeddb don't support use booleans as keys,
      // so we force to use collection to do the query.
      // see: https://github.com/dfahlander/Dexie.js/issues/70#issuecomment-77814592
      coll = coll || table.toCollection();
    }
    coll = ignoreCase
      ? where(key).equalsIgnoreCase(value)
      : where(key).equals(value);
  });

  ranges.forEach(
    ({ key, upper, lower, includeLower, includeUpper }: IRange) => {
      coll = where(key).between(lower, upper, includeLower, includeUpper);
    },
  );

  notEquals.forEach(({ key, value }: INotEqual) => {
    coll = where(key).notEqual(value);
  });

  startsWiths.forEach(({ key, value, ignoreCase }: IStartsWith) => {
    coll = ignoreCase
      ? where(key).startsWithIgnoreCase(value)
      : where(key).startsWith(value);
  });

  contains.forEach(({ key, value }: IContain) => {
    coll = where(key)
      .equals(value)
      .distinct();
  });

  filters.forEach((func: IFilter<T>, i) => {
    if (coll) {
      coll = coll.filter(func);
    } else {
      coll = table.filter(func);
    }
  });

  if (coll === undefined) {
    coll = table.toCollection();
  }

  if (desc) {
    coll = coll.reverse();
  }

  if (offsets) {
    coll = coll.offset(offsets);
  }

  if (limits) {
    coll = coll.limit(limits);
  }

  const collections: Dexie.Collection[] = [];

  if (coll) {
    collections.push(coll);
  }

  // parallel
  const parallel: IQuery<T>[] = query.parallel || [];
  if (parallel.length > 0) {
    const additions = parallel.map(query => execQuery(table, query)[0]);
    collections.push(...additions);
  }

  return collections;
};

export { execQuery };
