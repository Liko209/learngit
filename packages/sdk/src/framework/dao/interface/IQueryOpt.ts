/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-21 10:25:00
 */

import { IFilter } from 'foundation';

interface IQueryOpt<T> {
  reset(): IQueryOpt<T>;

  orderBy(key: string, desc: boolean): IQueryOpt<T>;

  reverse(): IQueryOpt<T>;

  or(query: IQueryOpt<T>): IQueryOpt<T>;

  equal(key: string, value: any, ignoreCase: boolean): IQueryOpt<T>;

  notEqual(key: string, value: any): IQueryOpt<T>;

  between(
    key: string,
    lowerBound: any,
    upperBound: any,
    includeLower: any,
    includeUpper: any,
  ): IQueryOpt<T>;

  greaterThan(key: string, value: any): IQueryOpt<T>;

  greaterThanOrEqual(key: string, value: any): IQueryOpt<T>;

  lessThan(key: string, value: any): IQueryOpt<T>;

  lessThanOrEqual(key: string, value: any): IQueryOpt<T>;

  anyOf(key: string, array: any[], ignoreCase: boolean): IQueryOpt<T>;

  startsWith(key: string, value: string, ignoreCase: boolean): IQueryOpt<T>;

  contain(key: string, value: any): IQueryOpt<T>;

  filter(filter: IFilter<T>): IQueryOpt<T>;

  offset(n: number): IQueryOpt<T>;

  limit(n: number): IQueryOpt<T>;

  toArray({ sortBy, desc }: { sortBy?: string; desc?: boolean }): Promise<T[]>;

  primaryKeys(): Promise<number[]>;

  count(): Promise<number>;

  first(): Promise<T | null>;

  last(): Promise<T | null>;
}

export { IQueryOpt };
