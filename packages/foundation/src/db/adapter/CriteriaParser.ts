/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-31 13:46:08
 * Copyright © RingCentral. All rights reserved.
 */
import { IQuery } from './../db';
import {
  IQueryCriteria,
  ICriteria,
  ICriteriaParser,
  IOrderBy,
  IEqual,
  IRange,
  INotEqual,
  IStartsWith,
  IContain,
  IFilter,
  IAnyOf
} from '../db';
export default class CriteriaParser<T> implements ICriteriaParser<T> {
  parallels: IQuery<T>[] = [];
  offsets: number = 0;
  limits: number = 0;
  orderBys: IOrderBy[] = [];
  desc: boolean = false;
  equals: IEqual[] = [];
  ranges: IRange[] = [];
  equalRangeCount: number = 0;
  notEquals: INotEqual[] = [];
  anyOfs: IAnyOf[] = [];
  startsWiths: IStartsWith[] = [];
  contains: IContain[] = [];
  filters: IFilter<T>[] = [];

  parse(criterias: IQueryCriteria<T>[]): ICriteria<T> {
    const result = {
      offsets: 0,
      limits: 0,
      orderBys: [],
      desc: false,
      ranges: [],
      equalRangeCount: 0,
      equals: [],
      notEquals: [],
      anyOfs: [],
      contains: [],
      filters: [],
      startsWiths: [],
      parallels: []
    };

    criterias.forEach(({ name, ...rest }) => {
      this[name].apply(result, Object.values(rest));
    });
    return result;
  }

  or(query: IQuery<T>) {
    this.parallels.push(query);
  }

  offset(amount: number) {
    this.offsets = amount;
  }

  limit(amount: number) {
    this.limits = amount;
  }

  orderBy(key: string, desc = false) {
    this.orderBys.push({ key, desc });
  }

  reverse() {
    this.desc = !this.desc;
  }

  equal(key: string, value: any, ignoreCase: boolean = false) {
    this.equals.push({
      key,
      value,
      ignoreCase
    });
  }

  notEqual(key: string, value: any) {
    this.notEquals.push({
      key,
      value
    });
  }

  between(
    key: string,
    lower: string | number | void[][] = -Infinity,
    upper: string | number | void[][] = Infinity,
    includeLower = false,
    includeUpper = false
  ) {
    this.ranges.push({
      key,
      lower,
      upper,
      includeLower,
      includeUpper
    });
  }

  greaterThan(key: string, value: any) {
    this.ranges.push({
      key,
      lower: value,
      upper: Infinity,
      includeLower: false,
      includeUpper: false
    });
  }

  greaterThanOrEqual(key: string, value: any) {
    this.ranges.push({
      key,
      lower: value,
      upper: Infinity,
      includeLower: true,
      includeUpper: false
    });
  }

  lessThan(key: string, value: any) {
    this.ranges.push({
      key,
      lower: -Infinity,
      upper: value,
      includeLower: false,
      includeUpper: false
    });
  }

  lessThanOrEqual(key: string, value: any) {
    this.ranges.push({
      key,
      lower: -Infinity,
      upper: value,
      includeLower: false,
      includeUpper: true
    });
  }

  anyOf(key: string, array: any[], ignoreCase = false) {
    this.anyOfs.push({
      key,
      array,
      ignoreCase
    });
  }

  startsWith(key: string, value: any, ignoreCase = false) {
    this.startsWiths.push({
      key,
      value,
      ignoreCase
    });
  }

  contain(key: string, value: any) {
    this.contains.push({
      key,
      value
    });
  }

  filter(func: IFilter<T>) {
    this.filters.push(func);
  }
}
