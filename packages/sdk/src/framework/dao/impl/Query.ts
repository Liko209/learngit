/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-03-05 11:25:49
 * Copyright © RingCentral. All rights reserved.
 */

import {
  IDatabaseCollection,
  IQueryCriteria,
  IQuery,
  IFilter,
  IDatabase,
} from 'foundation/db';
import { errorHandler } from '../errors/handler';
import { IQueryOpt } from '../interface/IQueryOpt';
import { ModelIdType, IdModel } from '../../model';

class Query<T extends IdModel<IdType>, IdType extends ModelIdType = number>
  implements IQueryOpt<T, IdType> {
  criteria: IQueryCriteria<T>[] = [];
  parallel?: IQuery<T>[];

  constructor(
    public collection: IDatabaseCollection<T, IdType>,
    public db: IDatabase,
  ) {
    this.reset();
  }

  reset(): Query<T, IdType> {
    this.criteria = [];
    this.parallel = [];
    return this;
  }

  /**
   * Only use one time
   * @param {String} key search key
   * @param {Boolean} desc is desc
   */
  orderBy(key: string, desc: boolean = false): Query<T, IdType> {
    this.criteria.push({
      key,
      desc,
      name: 'orderBy',
    });
    return this;
  }

  reverse(): Query<T, IdType> {
    this.criteria.push({
      name: 'reverse',
    });
    return this;
  }

  or(query: Query<T, IdType>): Query<T, IdType> {
    this.parallel = this.parallel || [];
    this.parallel.push(query);
    return this;
  }

  equal(
    key: string,
    value: any,
    ignoreCase: boolean = false,
  ): Query<T, IdType> {
    this.criteria.push({
      key,
      value,
      ignoreCase,
      name: 'equal',
    });
    return this;
  }

  notEqual(key: string, value: any): Query<T, IdType> {
    this.criteria.push({
      key,
      value,
      name: 'notEqual',
    });
    return this;
  }

  between(
    key: string,
    lowerBound: any,
    upperBound: any,
    includeLower: any,
    includeUpper: any,
  ): Query<T, IdType> {
    this.criteria.push({
      key,
      lowerBound,
      upperBound,
      includeLower,
      includeUpper,
      name: 'between',
    });
    return this;
  }

  greaterThan(key: string, value: any): Query<T, IdType> {
    this.criteria.push({
      key,
      value,
      name: 'greaterThan',
    });
    return this;
  }

  greaterThanOrEqual(key: string, value: any): Query<T, IdType> {
    this.criteria.push({
      key,
      value,
      name: 'greaterThanOrEqual',
    });
    return this;
  }

  lessThan(key: string, value: any): Query<T, IdType> {
    this.criteria.push({
      key,
      value,
      name: 'lessThan',
    });
    return this;
  }

  lessThanOrEqual(key: string, value: any): Query<T, IdType> {
    this.criteria.push({
      key,
      value,
      name: 'lessThanOrEqual',
    });
    return this;
  }

  anyOf(
    key: string,
    array: any[],
    ignoreCase: boolean = false,
  ): Query<T, IdType> {
    this.criteria.push({
      key,
      array,
      ignoreCase,
      name: 'anyOf',
    });
    return this;
  }

  startsWith(
    key: string,
    value: string,
    ignoreCase: boolean = false,
  ): Query<T, IdType> {
    this.criteria.push({
      key,
      value,
      ignoreCase,
      name: 'startsWith',
    });
    return this;
  }

  contain(key: string, value: any): Query<T, IdType> {
    this.criteria.push({
      key,
      value,
      name: 'contain',
    });
    return this;
  }

  filter(filter: IFilter<T>): Query<T, IdType> {
    this.criteria.push({
      filter,
      name: 'filter',
    });
    return this;
  }

  offset(n: number): Query<T, IdType> {
    this.criteria.push({
      name: 'offset',
      amount: n,
    });
    return this;
  }

  limit(n: number): Query<T, IdType> {
    this.criteria.push({
      name: 'limit',
      amount: n,
    });
    return this;
  }

  async toArray({
    sortBy,
    desc,
  }: { sortBy?: string; desc?: boolean } = {}): Promise<T[]> {
    if (typeof desc === 'boolean' && !sortBy) {
      throw new Error('sortBy should be specified if desc is specified');
    }
    try {
      await this.db.ensureDBOpened();
      const result = await this.collection.getAll(this, { sortBy, desc });
      return result;
    } catch (err) {
      errorHandler(err);
      return [];
    }
  }

  async primaryKeys(): Promise<IdType[]> {
    try {
      await this.db.ensureDBOpened();
      const result = await this.collection.primaryKeys(this);
      return result;
    } catch (err) {
      errorHandler(err);
      return [];
    }
  }

  async count(): Promise<number> {
    try {
      await this.db.ensureDBOpened();
      const result = await this.collection.count(this);
      if (result) {
        return result;
      }
      return 0;
    } catch (err) {
      errorHandler(err);
      return 0;
    }
  }

  async first(): Promise<T | null> {
    try {
      await this.db.ensureDBOpened();
      const result = await this.collection.first(this);
      if (result) {
        return result;
      }
      return null;
    } catch (err) {
      errorHandler(err);
      return null;
    }
  }

  async last(): Promise<T | null> {
    try {
      await this.db.ensureDBOpened();
      const result = await this.collection.last(this);
      if (result) {
        return result;
      }
      return null;
    } catch (err) {
      errorHandler(err);
      return null;
    }
  }
}

export default Query;
