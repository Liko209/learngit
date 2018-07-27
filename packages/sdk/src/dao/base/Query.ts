/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-03-05 11:25:49
* Copyright © RingCentral. All rights reserved.
*/

import { IDatabaseCollection, IQueryCriteria, IQuery, IFilter, IDatabase } from 'foundation';
class Query<T> implements IQuery<T> {
  criteria: IQueryCriteria<T>[] = [];
  parallel?: IQuery<T>[];

  constructor(public collection: IDatabaseCollection<T>, public db: IDatabase) {
    this.reset();
  }

  reset(): Query<T> {
    this.criteria = [];
    this.parallel = [];
    return this;
  }

  /**
   * Only use one time
   * @param {String} key search key
   * @param {Boolean} desc is desc
   */
  orderBy(key: string, desc: boolean = false): Query<T> {
    this.criteria.push({
      name: 'orderBy',
      key,
      desc
    });
    return this;
  }

  reverse(): Query<T> {
    this.criteria.push({
      name: 'reverse'
    });
    return this;
  }

  or(query: Query<T>): Query<T> {
    this.parallel = this.parallel || [];
    this.parallel.push(query);
    return this;
  }

  equal(key: string, value: any, ignoreCase: boolean = false): Query<T> {
    this.criteria.push({
      name: 'equal',
      key,
      value,
      ignoreCase
    });
    return this;
  }

  notEqual(key: string, value: any): Query<T> {
    this.criteria.push({
      name: 'notEqual',
      key,
      value
    });
    return this;
  }

  between(key: string, lowerBound: any, upperBound: any, includeLower: any, includeUpper: any): Query<T> {
    this.criteria.push({
      name: 'between',
      key,
      lowerBound,
      upperBound,
      includeLower,
      includeUpper
    });
    return this;
  }

  greaterThan(key: string, value: any): Query<T> {
    this.criteria.push({
      name: 'greaterThan',
      key,
      value
    });
    return this;
  }

  greaterThanOrEqual(key: string, value: any): Query<T> {
    this.criteria.push({
      name: 'greaterThanOrEqual',
      key,
      value
    });
    return this;
  }

  lessThan(key: string, value: any): Query<T> {
    this.criteria.push({
      name: 'lessThan',
      key,
      value
    });
    return this;
  }

  lessThanOrEqual(key: string, value: any): Query<T> {
    this.criteria.push({
      name: 'lessThanOrEqual',
      key,
      value
    });
    return this;
  }

  anyOf(key: string, array: Array<any>, ignoreCase: boolean = false): Query<T> {
    this.criteria.push({
      name: 'anyOf',
      key,
      array,
      ignoreCase
    });
    return this;
  }

  startsWith(key: string, value: string, ignoreCase: boolean = false): Query<T> {
    this.criteria.push({
      name: 'startsWith',
      key,
      value,
      ignoreCase
    });
    return this;
  }

  contain(key: string, value: any): Query<T> {
    this.criteria.push({
      name: 'contain',
      key,
      value
    });
    return this;
  }

  filter(filter: IFilter<T>): Query<T> {
    this.criteria.push({
      name: 'filter',
      filter
    });
    return this;
  }

  offset(n: number): Query<T> {
    this.criteria.push({
      name: 'offset',
      amount: n
    });
    return this;
  }

  limit(n: number): Query<T> {
    this.criteria.push({
      name: 'limit',
      amount: n
    });
    return this;
  }

  async toArray({ sortBy, desc }: { sortBy?: string; desc?: boolean } = {}): Promise<T[]> {
    if (typeof desc === 'boolean' && !sortBy) {
      throw new Error('sortBy should be specified if desc is specified');
    }
    await this.db.ensureDBOpened();
    return this.collection.getAll(this, { sortBy, desc });
  }

  async count(): Promise<number> {
    await this.db.ensureDBOpened();
    const result = await this.collection.count(this);
    if (result) {
      return result;
    }
    return 0;
  }

  async first(): Promise<T | null> {
    await this.db.ensureDBOpened();
    const result = await this.collection.first(this);
    if (result) {
      return result;
    }
    return null;
  }

  async last(): Promise<T | null> {
    await this.db.ensureDBOpened();
    const result = await this.collection.last(this);
    if (result) {
      return result;
    }
    return null;
  }
}

export default Query;
