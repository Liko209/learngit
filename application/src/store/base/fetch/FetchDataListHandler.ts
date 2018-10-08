/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-06 19:39:12
 * Copyright © RingCentral. All rights reserved.
 */

import { FetchDataDirection } from './types';
import { ListStore } from './ListStore';
import { ENTITY_NAME } from '@/store/constants';
import storeManager from '@/store';
import BaseNotificationSubscribable from '@/store/base/BaseNotificationSubscribable';

const PAGE_SIZE = 20;

export interface IFetchDataListHandlerOptions {
  pageSize?: number;
  hasMoreUp?: boolean;
  hasMoreDown?: boolean;
  entityName?: ENTITY_NAME;
}

export interface IFetchDataProvider<T> {
  fetchData(
    offset: number,
    direction: FetchDataDirection,
    pageSize: number,
    anchor: T | null,
  ): Promise<T[]>;
}

export class FetchDataListHandler<T> extends BaseNotificationSubscribable {
  private _fetchDataProvider: IFetchDataProvider<T> | null;
  private _listStore: ListStore<T>;
  private _pageSize: number;
  private _hasMoreUp = false;
  private _hasMoreDown = false;
  protected _entityName?: ENTITY_NAME;

  constructor(
    dataProvider: IFetchDataProvider<T> | null,
    options: IFetchDataListHandlerOptions,
    listStore: ListStore<T> = new ListStore<T>(),
  ) {
    super();
    this._fetchDataProvider = dataProvider;
    this._listStore = listStore;
    this._pageSize = options.pageSize ? options.pageSize : PAGE_SIZE;
    this._hasMoreDown = options.hasMoreDown ? options.hasMoreDown : false;
    this._hasMoreUp = options.hasMoreUp ? options.hasMoreUp : false;
    this._entityName = options.entityName;
  }

  get listStore() {
    return this._listStore;
  }

  hasMore(direction: FetchDataDirection) {
    return direction === FetchDataDirection.UP
      ? this._hasMoreUp
      : this._hasMoreDown;
  }

  async fetchData(direction: FetchDataDirection) {
    let offset = 0;
    let anchor: T | null = null;
    if (direction === FetchDataDirection.DOWN) {
      offset = this._listStore.getSize();
      anchor = this._listStore.first() || null;
    } else {
      anchor = this._listStore.last() || null;
    }

    await this.fetchDataInternal(offset, direction, this._pageSize, anchor);
  }

  protected async fetchDataInternal(
    offset: number,
    direction: FetchDataDirection,
    pageSize: number,
    anchor: T | null,
  ) {
    if (this._fetchDataProvider) {
      const result = await this._fetchDataProvider.fetchData(
        offset,
        direction,
        this._pageSize,
        anchor,
      );
      this.handlePageData(result, direction);
      this.updateEntityStore(result);
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

  protected handlePageData(result: T[], direction: FetchDataDirection) {
    let inFront = false;
    if (direction === FetchDataDirection.DOWN) {
      this._hasMoreDown = result.length >= this._pageSize;
    } else {
      this._hasMoreUp = result.length >= this._pageSize;
      inFront = true;
    }

    if (result.length > 0) {
      this._listStore.append(result, inFront);
    }
  }
}
