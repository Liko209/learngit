/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-08 10:13:46
 * Copyright © RingCentral. All rights reserved.
 */
import { SortableListStore } from './SortableListStore';
import { ModelIdType } from 'sdk/framework/model';

export interface ISortableModel<IdType extends ModelIdType = number> {
  id: IdType;
  sortValue: number;
}

export interface ISortableModelWithData<T> extends ISortableModel {
  data?: T;
}

export interface IMatchFunc<Model> {
  (model: Model): Boolean;
}

export interface ITransformFunc<
  Model,
  IdType extends ModelIdType = number,
  SortableModel extends ISortableModel<IdType> = ISortableModel<IdType>
> {
  (model: Model): SortableModel;
}

export interface ISortFunc<
  IdType extends ModelIdType = number,
  SortableModel extends ISortableModel<IdType> = ISortableModel<IdType>
> {
  (first: SortableModel, second: SortableModel): number;
}

export type TDelta<
  IdType extends ModelIdType = number,
  SortableModel extends ISortableModel<IdType> = ISortableModel<IdType>
> = {
  added: SortableModel[];
  updated: SortableModel[];
  deleted: IdType[];
};

export type TChangeHandler<
  Model,
  IdType extends ModelIdType = number,
  SortableModel extends ISortableModel<IdType> = ISortableModel<IdType>
> = (
  keys: number[],
  entities?: Map<number, Model>,
  transformFunc?: Function,
  store?: SortableListStore<IdType, SortableModel>,
) => {
  deleted: number[];
  updated: TUpdated;
  updateEntity: Model[];
  added: SortableModel[];
};

export type TUpdated<SortableModel extends ISortableModel = ISortableModel> = {
  value: SortableModel;
  index: number;
  oldValue?: SortableModel;
}[];

export type TReplacedData<
  SortableModel extends ISortableModel = ISortableModel
> = {
  id: number;
  data: SortableModel;
};

export interface IEntityDataProvider<Model> {
  getByIds(ids: number[]): Promise<Model[]>;
}
