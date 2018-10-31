/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-04-11 08:49:23
 * Copyright © RingCentral. All rights reserved.
 */
import Loki from 'lokijs';
import CriteriaParser from '../CriteriaParser';
// import LokiCollection from './LokiCollection';
// import { array } from 'prop-types';
import { IQuery, ICriteria, IRange, IEqual, IContain, IFilter } from '../../db';

function isLokiCollection(collection: any): collection is Loki.Collection {
  return collection.chain !== undefined;
}

export const execQuery = <T extends {}>(
  collection: Loki.Collection,
  query: IQuery<T> = { criteria: [], parallel: [] },
): Resultset<T>[] => {
  let resultSet = isLokiCollection(collection)
    ? collection.chain()
    : collection;

  if (query.criteria.length === 0) return [resultSet.find()];

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
  }: ICriteria<T> = new CriteriaParser<T>().parse(query.criteria);

  anyOfs.forEach(({ key, array, ignoreCase }) => {
    const condition = ignoreCase
      ? { [key]: { $regex: new RegExp(array.join('|'), 'i') } }
      : { [key]: { $in: array } };
    resultSet = resultSet.find(condition);
  });

  ranges.forEach(
    ({ key, lower, upper, includeLower, includeUpper }: IRange) => {
      const $and: any[] = [];
      if (lower) {
        const condition = {
          [key]: {
            [includeLower ? '$gte' : '$gt']: lower,
          },
        };
        $and.push(condition);
      }
      if (upper) {
        const condition = {
          [key]: {
            [includeUpper ? '$lte' : '$lt']: upper,
          },
        };
        $and.push(condition);
      }
      resultSet = resultSet.find({ $and });
    },
  );

  equals.forEach(({ key, value, ignoreCase }: IEqual) => {
    const condition = ignoreCase
      ? { [key]: { $regex: new RegExp(value, 'i') } }
      : { [key]: value };
    resultSet = resultSet.find(condition);
  });

  notEquals.forEach(({ key, value }) => {
    const condition = { [key]: { $ne: value } };
    resultSet = resultSet.find(condition);
  });

  startsWiths.forEach(({ key, value, ignoreCase }) => {
    const $regex = new RegExp(`^${value}`, ignoreCase ? 'i' : undefined);
    const condition = { [key]: { $regex } };
    resultSet = resultSet.find(condition);
  });

  filters.forEach((fn: IFilter<T>) => {
    resultSet = resultSet.where(fn);
  });

  contains.forEach(({ key, value }: IContain) => {
    resultSet = resultSet.find({ [key]: { $contains: value } });
  });

  // TODO multi orderBy
  const orderBy = orderBys[0];
  if (orderBy) {
    const { key, desc } = orderBy;
    resultSet = resultSet.simplesort(key, { desc });
  }

  if (desc) {
    resultSet = resultSet.simplesort('id', { desc });
  }

  if (offsets) {
    resultSet = resultSet.offset(offsets);
  }

  if (limits) {
    resultSet = resultSet.limit(limits);
  }

  const resultSets: Resultset<T>[] = [];
  resultSets.push(resultSet);

  //
  // Parallel
  //
  const parallel: IQuery<T>[] = query.parallel || [];
  if (parallel.length > 0) {
    const additions = parallel.map(query => execQuery(collection, query)[0]);
    resultSets.push(...additions);
  }

  return resultSets;
};
