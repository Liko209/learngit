/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-04-11 08:49:23
 * Copyright © RingCentral. All rights reserved.
 */
import Loki from 'lokijs';
import CriteriaParser from '../CriteriaParser';
// import LokiCollection from './LokiCollection';
// import { array } from 'prop-types';
import { IQuery, ICriteria, IRange, IEqual, IContain } from '../../db';

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
    ranges,
    orderBys,
    equals,
    contains,
  }: ICriteria<T> = new CriteriaParser<T>().parse(query.criteria);

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
    resultSet = resultSet.find({ [key]: value });
  });

  contains.forEach(({ key, value }: IContain) => {
    resultSet = resultSet.find({ [key]: { $contains: value } });
  });

  // TODO multi orderBy
  const orderBy = orderBys[0];
  if (orderBy) {
    resultSet = resultSet.simplesort(orderBy.key);
  }

  const resultSets: Resultset<T>[] = [];
  resultSets.push(resultSet);

  // parallel
  const parallel: IQuery<T>[] = query.parallel || [];
  if (parallel.length > 0) {
    const additions = parallel.map(query => execQuery(collection, query)[0]);
    resultSets.push(...additions);
  }

  return resultSets;
};
