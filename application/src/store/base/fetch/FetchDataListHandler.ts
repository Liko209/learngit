/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-06 19:39:12
 * Copyright © RingCentral. All rights reserved.
 */
import { ENTITY_NAME } from '@/store/constants';
import storeManager from '@/store';
import BaseNotificationSubscribable from '@/store/base/BaseNotificationSubscribable';
import { QUERY_DIRECTION } from 'sdk/dao';
import { TDelta } from './types';
import { ListStore } from './ListStore';
import { DEFAULT_PAGE_SIZE } from './constant';

export type DeltaDataHandler = (delta: TDelta) => any;
export interface IFetchDataListHandlerOptions {
  pageSize?: number;
  hasMoreUp?: boolean;
  hasMoreDown?: boolean;
  entityName?: ENTITY_NAME;
  dataChangeCallBack?: DeltaDataHandler;
}

export interface IFetchDataProvider<T> {
  fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: T,
  ): Promise<T[]>;
}

export class FetchDataListHandler<T> extends BaseNotificationSubscribable {
  private _fetchDataProvider: IFetchDataProvider<T> | null;
  private _listStore: ListStore<T>;
  protected _pageSize: number;
  protected _entityName?: ENTITY_NAME;
  protected _dataChangeCallBacks: DeltaDataHandler[] = [];

  constructor(
    dataProvider: IFetchDataProvider<T> | null,
    options: IFetchDataListHandlerOptions,
    listStore: ListStore<T> = new ListStore<T>(),
  ) {
    super();
    this._fetchDataProvider = dataProvider;
    this._listStore = listStore;
    const {
      pageSize = DEFAULT_PAGE_SIZE,
      hasMoreDown = false,
      hasMoreUp = false,
      entityName,
      dataChangeCallBack,
    } = options;
    this._pageSize = pageSize;
    this._entityName = entityName;
    this.listStore._hasMoreUp = hasMoreUp;
    this.listStore._hasMoreDown = hasMoreDown;
    if (dataChangeCallBack) {
      this.addDataChangeCallback(dataChangeCallBack);
    }
  }

  get listStore() {
    return this._listStore;
  }

  hasMore(direction: QUERY_DIRECTION) {
    return direction === QUERY_DIRECTION.OLDER
      ? this.listStore._hasMoreUp
      : this.listStore._hasMoreDown;
  }

  setHasMore(value: boolean, direction: QUERY_DIRECTION) {
    return this.listStore.setHasMore(
      value,
      direction === QUERY_DIRECTION.OLDER,
    );
  }

  addDataChangeCallback(cb: DeltaDataHandler) {
    if (cb && !this._dataChangeCallBacks.includes(cb)) {
      this._dataChangeCallBacks.push(cb);
    }
  }

  removeDataChangeCallback(cb: DeltaDataHandler) {
    if (cb) {
      const index = this._dataChangeCallBacks.indexOf(cb);
      if (index >= 0) {
        this._dataChangeCallBacks.splice(index, 1);
      }
    }
  }

  async fetchData(direction: QUERY_DIRECTION, pageSize?: number) {
    const size = pageSize ? pageSize : this._pageSize;
    let anchor: T | undefined;
    if (direction === QUERY_DIRECTION.OLDER) {
      anchor = this._listStore.first();
    } else {
      anchor = this._listStore.last();
    }

    return this.fetchDataInternal(direction, size, anchor);
  }

  protected async fetchDataInternal(
    direction: QUERY_DIRECTION,
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

  protected replaceEntityStore<Entity>(replaceEntities: Map<number, Entity>) {
    if (!replaceEntities.size) {
      return;
    }

    if (this._entityName) {
      storeManager.dispatchReplacedDataModels(
        this._entityName,
        replaceEntities,
      );
    }
  }

  protected handlePageData(result: T[], direction: QUERY_DIRECTION) {
    let inFront = false;
    if (direction === QUERY_DIRECTION.OLDER) {
      inFront = true;
    }
    const hasMore = result.length >= this._pageSize;
    this.listStore.setHasMore(hasMore, inFront);
    if (result.length > 0) {
      this._listStore.append(result, inFront);
    }
  }

  get size() {
    return this._listStore.size;
  }

  dispose() {
    super.dispose();
  }
}
