/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-08 10:13:46
 * Copyright © RingCentral. All rights reserved.
 */
import { SortableListStore } from './SortableListStore';

export interface ISortableModel<T = any> {
  id: number;
  sortValue: number;
  data?: T;
}

export interface ISortFunc<T> {
  (first: T, second: T): number;
}

export interface IMatchFunc<T> {
  (model: T): Boolean;
}
export interface ITransformFunc<T> {
  (model: T): ISortableModel<T>;
}

export interface ISortFunc<T> {
  (first: T, second: T): number;
}

export type TDelta = {
  added: ISortableModel[];
  updated: ISortableModel[];
  deleted: number[];
};

export type TChangeHandler<T> = (
  keys: number[],
  entities?: Map<number, T>,
  transformFunc?: Function,
  store?: SortableListStore,
) => {
  deleted: number[];
  updated: TUpdated;
  updateEntity: T[];
  added: ISortableModel[];
};

export type TUpdated = {
  value: ISortableModel;
  index: number;
  oldValue?: ISortableModel;
}[];

export type TReplacedData<T> = {
  id: number;
  data: T;
};

export interface IEntityDataProvider<T> {
  getByIds(ids: number[]): Promise<T[]>;
}
