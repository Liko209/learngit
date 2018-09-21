/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:49
 * Copyright © RingCentral. All rights reserved.
 */
import ListStore from '@/store/base/ListStore';
import _ from 'lodash';
import { BaseModel } from 'sdk/models';
import { IEntity, IIDSortKey, IIncomingData } from '../store';
import ListHandler from '@/store/base/ListHandler';
import OrderListHandler, {
  BIND_EVENT,
  DIRECTION,
} from '@/store/base/OrderListHandler';
import OrderListStore from '@/store/base/OrderListStore';
import { ENTITY_NAME } from '@/store/constants';
type TDelta = {
  updated: IIDSortKey[];
  deleted: number[];
  direction: DIRECTION;
};

export default class TransformHandler<
  T extends BaseModel,
  K extends IEntity
> extends ListHandler<T, IIDSortKey, ListStore<IIDSortKey>> {
  protected _store: ListStore<IIDSortKey>;
  constructor(private _orderListHandler: OrderListHandler<T, K>) {
    super();
    this.subscribeModification();
  }
  handleIncomingData(entity: ENTITY_NAME, data: IIncomingData<T>) {
    this._orderListHandler.handleIncomingData(entity, data);
  }

  handlePageData(
    entityName: ENTITY_NAME,
    dataModels: IEntity[],
    isBigger: boolean,
  ) {
    return this._orderListHandler.handlePageData(
      entityName,
      dataModels,
      isBigger,
    );
  }

  get orderListStore(): OrderListStore {
    return this._orderListHandler.store;
  }
  get items() {
    return this.store.getItems();
  }

  modificationHandler = (delta: TDelta) => {
    const { updated, deleted, direction } = delta;

    if (updated.length) {
      const added = _(updated)
        .differenceBy(this.store.items, 'id')
        .value();
      this.onAdded(direction, added);
    }
    if (deleted.length) {
      this.onDeleted(deleted);
    }
  }
  onAdded(direction: DIRECTION, addedItems: IIDSortKey[]) {
    const strategy = {
      [DIRECTION.NEWER]: 'prepend',
      [DIRECTION.OLDER]: 'append',
    }[direction];
    this.store[strategy](...addedItems);
  }
  onDeleted(deletedItems: number[]) {
    this.store.delete(item => deletedItems.includes(item.id));
  }
  subscribeModification() {
    this._orderListHandler.on(BIND_EVENT.DATA_CHANGE, this.modificationHandler);
  }
}

export { TransformHandler };
