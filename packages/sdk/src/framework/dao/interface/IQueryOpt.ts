/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-21 10:25:00
 */

import { IFilter } from 'foundation/db';
import { ModelIdType } from '../../model';

interface IQueryOpt<T, IdType extends ModelIdType = number> {
  reset(): IQueryOpt<T, IdType>;

  orderBy(key: string, desc: boolean): IQueryOpt<T, IdType>;

  reverse(): IQueryOpt<T, IdType>;

  or(query: IQueryOpt<T, IdType>): IQueryOpt<T, IdType>;

  equal(key: string, value: any, ignoreCase: boolean): IQueryOpt<T, IdType>;

  notEqual(key: string, value: any): IQueryOpt<T, IdType>;

  between(key: string, lowerBound: any, upperBound: any, includeLower: any, includeUpper: any): IQueryOpt<T, IdType>;

  greaterThan(key: string, value: any): IQueryOpt<T, IdType>;

  greaterThanOrEqual(key: string, value: any): IQueryOpt<T, IdType>;

  lessThan(key: string, value: any): IQueryOpt<T, IdType>;

  lessThanOrEqual(key: string, value: any): IQueryOpt<T, IdType>;

  anyOf(key: string, array: any[], ignoreCase: boolean): IQueryOpt<T, IdType>;

  startsWith(key: string, value: string, ignoreCase: boolean): IQueryOpt<T, IdType>;

  contain(key: string, value: any): IQueryOpt<T, IdType>;

  filter(filter: IFilter<T>): IQueryOpt<T, IdType>;

  offset(n: number): IQueryOpt<T, IdType>;

  limit(n: number): IQueryOpt<T, IdType>;

  toArray({ sortBy, desc }: { sortBy?: string; desc?: boolean }): Promise<T[]>;

  primaryKeys(): Promise<IdType[]>;

  count(): Promise<number>;

  first(): Promise<T | null>;

  last(): Promise<T | null>;
}

export { IQueryOpt };
