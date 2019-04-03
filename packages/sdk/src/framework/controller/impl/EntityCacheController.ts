/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 15:16:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IEntityCacheController } from '../interface/IEntityCacheController';
import { IdModel, Raw } from '../../model';
import _ from 'lodash';

enum CACHE_INITIAL_STATUS {
  NONE,
  INPROGRESS,
  SUCCESS,
}

class EntityCacheController<T extends IdModel = IdModel>
  implements IEntityCacheController<T> {
  protected _entities: Map<number, T> = new Map(); // { [id: number]: T } = {};

  private _initialStatus: CACHE_INITIAL_STATUS;

  constructor() {
    this._initialStatus = CACHE_INITIAL_STATUS.NONE;
  }

  initialize(entities: T[]) {
    this._initialStatus = CACHE_INITIAL_STATUS.INPROGRESS;
    this.clear();
    this.bulkPut(entities);
    this._initialStatus = CACHE_INITIAL_STATUS.SUCCESS;
  }

  isInitialized() {
    return this._initialStatus === CACHE_INITIAL_STATUS.SUCCESS;
  }

  isStartInitial() {
    return this._initialStatus !== CACHE_INITIAL_STATUS.NONE;
  }

  async put(item: T | T[]): Promise<void> {
    if (Array.isArray(item)) {
      await this.bulkPut(item);
    } else {
      this.putInternal(item);
    }
  }

  async bulkPut(array: T[]): Promise<void> {
    array.forEach(async (item: T) => {
      await this.putInternal(item);
    });
  }

  async clear(): Promise<void> {
    this._entities.clear();
  }

  async delete(key: number): Promise<void> {
    this.deleteInternal(key);
  }

  async bulkDelete(keys: number[]): Promise<void> {
    keys.forEach(async (key: number) => {
      await this.deleteInternal(key);
    });
  }

  async update(item: Partial<T> | Partial<T>[]): Promise<void> {
    this._updatePartially(item);
  }

  async bulkUpdate(array: Partial<T>[]): Promise<void> {
    this._updatePartially(array);
  }

  async get(key: number): Promise<T | null> {
    return this.getSynchronously(key);
  }

  getSynchronously(key: number): T | null {
    const result = this._entities.get(key);
    return result ? result : null;
  }

  async batchGet(ids: number[], order?: boolean): Promise<T[]> {
    const entities: T[] = [];

    const promises = ids.map(async (id: number) => {
      return this.get(id);
    });

    await Promise.all(promises).then((results: (T | null)[]) => {
      results.forEach((result: T | null) => {
        if (result) {
          entities.push(result);
        }
      });
    });

    return entities;
  }

  getEntityName(): string {
    return '';
  }

  async getAll(): Promise<T[]> {
    return Array.from(this._entities.values());
  }

  async getTotalCount(): Promise<number> {
    return this._entities.size;
  }

  getEntityNotificationKey(): string {
    return '';
  }

  async getEntities(filterFunc?: (entity: T) => boolean): Promise<T[]> {
    const values = await this.getAll();
    if (filterFunc) {
      const filterEntities: T[] = [];
      values.forEach((entity: T) => {
        if (filterFunc(entity)) {
          filterEntities.push(entity);
        }
      });
      return filterEntities;
    }
    return values;
  }

  async replace(ids: number[], entities: Map<number, T>) {
    ids.forEach((id: number) => {
      this.deleteInternal(id);
    });

    entities.forEach((entity: T) => {
      this.putInternal(entity);
    });
  }

  async updateEx(
    entities: Map<number, T>,
    partials?: Map<number, Partial<Raw<T>>>,
  ) {
    if (partials) {
      partials.forEach((partialModel, id) => {
        const oldEntity = this._entities[id];
        if (oldEntity) {
          this._updatePartial(oldEntity, partialModel);
        } else {
          const partialObject: {} = partialModel;
          this._entities[id] = partialObject as T;
        }
      });
    } else {
      entities.forEach((entity, id) => {
        this._update(entity, id);
      });
    }
  }

  private _update(entity: T, id: number) {
    const oldEntity = this._entities.get(id);
    if (oldEntity) {
      this._updatePartial(oldEntity, entity);
    } else {
      this.putInternal(entity);
    }
  }

  private _updatePartially(item: Partial<T> | Partial<T>[]) {
    if (Array.isArray(item)) {
      item.forEach((item: Partial<T>) => {
        this._updatePartially(item);
      });
    } else {
      const oldItem = this._entities.get(item.id!);
      if (oldItem) {
        Object.keys(item).forEach((key: string) => {
          oldItem[key] = item[key];
        });
      } else {
        this.putInternal(item as T);
      }
    }
  }

  protected deleteInternal(key: number) {
    if (this._entities.has(key)) {
      this._entities.delete(key);
    }
  }

  protected putInternal(item: T) {
    this._entities.set(item.id, item);
  }

  private _updatePartial(oldEntity: T, partialEntity: Partial<Raw<T>> | T) {
    Object.keys(partialEntity).forEach((key: string) => {
      oldEntity[key] = partialEntity[key];
    });
  }
}

export { EntityCacheController, CACHE_INITIAL_STATUS };
