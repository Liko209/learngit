/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-06 19:39:12
 * Copyright © RingCentral. All rights reserved.
 */
import { TDelta, FetchDataDirection } from './types';
import { ListStore } from './ListStore';
import { ENTITY_NAME } from '@/store/constants';
import storeManager from '@/store';
import BaseNotificationSubscribable from '@/store/base/BaseNotificationSubscribable';

const PAGE_SIZE = 20;
type DeltaDataHandler = (delta: TDelta) => any;
export interface IFetchDataListHandlerOptions {
  pageSize?: number;
  hasMoreUp?: boolean;
  hasMoreDown?: boolean;
  entityName?: ENTITY_NAME;
  dataChangeCallBack?: DeltaDataHandler;
}

export interface IFetchDataProvider<T> {
  fetchData(
    // offset: number,
    direction: FetchDataDirection,
    pageSize: number,
    anchor?: T,
  ): Promise<T[]>;
}

export class FetchDataListHandler<T> extends BaseNotificationSubscribable {
  private _fetchDataProvider: IFetchDataProvider<T> | null;
  private _listStore: ListStore<T>;
  protected _pageSize: number;
  protected _entityName?: ENTITY_NAME;
  protected _dataChangeCallBack: DeltaDataHandler;

  constructor(
    dataProvider: IFetchDataProvider<T> | null,
    options: IFetchDataListHandlerOptions,
    listStore: ListStore<T> = new ListStore<T>(),
  ) {
    super();
    this._fetchDataProvider = dataProvider;
    this._listStore = listStore;
    const {
      pageSize = PAGE_SIZE,
      hasMoreDown = false,
      hasMoreUp = false,
      entityName,
    } = options;
    this._pageSize = pageSize;
    this._entityName = entityName;
    this.listStore._hasMoreUp = hasMoreUp;
    this.listStore._hasMoreDown = hasMoreDown;
  }

  get listStore() {
    return this._listStore;
  }

  hasMore(direction: FetchDataDirection) {
    return direction === FetchDataDirection.UP
      ? this.listStore._hasMoreUp
      : this.listStore._hasMoreDown;
  }

  setHasMore(value: boolean, direction: FetchDataDirection) {
    return this.listStore.setHasMore(
      value,
      direction === FetchDataDirection.UP,
    );
  }
  setUpDataChangeCallback(cb: DeltaDataHandler) {
    this._dataChangeCallBack = cb;
  }
  async fetchData(direction: FetchDataDirection, pageSize?: number) {
    const size = pageSize ? pageSize : this._pageSize;
    let anchor: T | undefined;
    if (direction === FetchDataDirection.UP) {
      anchor = this._listStore.first();
    } else {
      anchor = this._listStore.last();
    }
    return this.fetchDataInternal(direction, size, anchor);
  }

  protected async fetchDataInternal(
    direction: FetchDataDirection,
    pageSize: number,
    anchor?: T,
  ): Promise<any> {
    if (this._fetchDataProvider) {
      const result = await this._fetchDataProvider.fetchData(
        direction,
        this._pageSize,
        anchor,
      );
      this.handlePageData(result, direction);
      this.updateEntityStore(result);
      return result;
    }
  }

  protected updateEntityStore<Entity>(entities: Entity[]) {
    if (!entities.length) {
      return;
    }
    if (this._entityName) {
      storeManager.dispatchUpdatedDataModels(this._entityName, entities);
    }
  }

  protected replaceEntityStore<Entity>(entities: Entity[]) {
    if (!entities.length) {
      return;
    }

    if (this._entityName) {
      storeManager.dispatchReplacedDataModels(this._entityName, entities);
    }
  }

  protected handlePageData(result: T[], direction: FetchDataDirection) {
    let inFront = false;
    if (direction === FetchDataDirection.UP) {
      inFront = true;
    }
    const hasMore = result.length >= this._pageSize;
    this.listStore.setHasMore(hasMore, inFront);
    if (result.length > 0) {
      this._listStore.append(result, inFront);
    }
  }
}
