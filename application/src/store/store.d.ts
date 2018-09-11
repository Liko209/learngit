import OrderListStore from './base/OrderListStore';
import { ENTITY_NAME, HANDLER_TYPE } from './constants';
import { BaseService } from 'sdk/service';
import { BaseModel } from 'sdk/models';

export type IEntity = {
  id: number;
  data?: any;
  [name: string]: any;
}

export type IIncomingData<T> = {
  type: string;
  entities: Map<number, T>;
}

export type IIDSortKey = {
  id: number;
  sortKey: number;
  metadata?: {};
}

export type IHandleIncomingDataByType = {
  [event: string]: <T>(matchedKeys: number[], entities: Map<number,  T>, transformFunc: Function, store: OrderListStore) => {
    deleted: number[],
    updated: IIDSortKey[],
    updateEntity: T[],
  }
}

export type IEntitySetting = {
  event: string[],
  service: Function | [Function, string],
  type: HANDLER_TYPE,
  cacheCount: number,
}

export type ISortFunc = (IdSortKeyPrev: IIDSortKey, IdSortKeyNext: IIDSortKey) =>  number

