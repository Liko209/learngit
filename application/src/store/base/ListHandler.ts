import _ from 'lodash';
import { BaseModel } from 'sdk/models';

import storeManager from './StoreManager';
import BaseNotificationSubscribable from './BaseNotificationSubscribable';

import { IEntity, IIncomingData } from '../store';
import { ENTITY_NAME } from '../constants';
import ListStore from '@/store/base/ListStore';
const DEFAULT_PAGE_SIZE = 20;

export default abstract class ListHandler<
  T extends BaseModel,
  I,
  S extends ListStore<I>
> extends BaseNotificationSubscribable {
  protected _pageSize: number = DEFAULT_PAGE_SIZE;
  protected _store: S;

  constructor() {
    super();
    this._store = new ListStore<I>() as S;
  }
  abstract handleIncomingData(
    entityName: ENTITY_NAME,
    { type, entities }: IIncomingData<T>,
  ): void;
  abstract handlePageData(
    entityName: ENTITY_NAME,
    dataModels: IEntity[],
    isBigger: boolean,
  ): void;

  get store() {
    return this._store;
  }

  updateEntityStore(entityName: ENTITY_NAME, entities: IEntity[]) {
    if (!entities.length) {
      return;
    }
    storeManager.dispatchUpdatedDataModels(entityName, entities);
  }
}

export { ListHandler };
