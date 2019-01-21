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
  private _entities: { [id: number]: T } = {};

  private _initialStatus: CACHE_INITIAL_STATUS;

  constructor() {
    this._initialStatus = CACHE_INITIAL_STATUS.NONE;
  }

  initialize(entities: T[]) {
    this._initialStatus = CACHE_INITIAL_STATUS.INPROGRESS;
    this.clear();
    _.forEach(entities, (model: T) => {
      this.put(model);
    });
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
      this._entities[item.id] = item;
    }
  }

  async bulkPut(array: T[]): Promise<void> {
    array.forEach(async (item: T) => {
      await this.put(item);
    });
  }

  async clear(): Promise<void> {
    this._entities = {};
  }

  async delete(key: number): Promise<void> {
    const entity = this._entities[key];
    if (entity) {
      delete this._entities[key];
    }
  }

  async bulkDelete(keys: number[]): Promise<void> {
    keys.forEach(async (key: number) => {
      await this.delete(key);
    });
  }

  async update(item: Partial<T> | Partial<T>[]): Promise<void> {
    if (Array.isArray(item)) {
      this.bulkUpdate(item);
    } else {
      const oldItem = this._entities[item.id!];
      if (oldItem) {
        Object.keys(item).forEach((key: string) => {
          oldItem[key] = item[key];
        });
      } else {
        await this.put(item as T);
      }
    }
  }

  async bulkUpdate(array: Partial<T>[]): Promise<void> {
    array.forEach(async (item: Partial<T>) => {
      await this.update(item);
    });
  }

  async get(key: number): Promise<T | null> {
    return this._entities[key];
  }

  async batchGet(ids: number[]): Promise<T[]> {
    const entities: T[] = [];
    ids.forEach(async (id: number) => {
      const entity = await this.get(id);
      if (entity) {
        entities.push(entity);
      }
    });
    return entities;
  }

  getEntityNotificationKey(): string {
    return '';
  }

  async getEntities(filterFunc?: (entity: T) => boolean): Promise<T[]> {
    if (filterFunc) {
      const filterEntities: T[] = [];
      Object.values(this._entities).forEach((entity: T) => {
        if (filterFunc(entity)) {
          filterEntities.push(entity);
        }
      });
      return filterEntities;
    }
    return Object.values(this._entities);
  }

  async replace(ids: number[], entities: Map<number, T>) {
    ids.forEach((id: number) => {
      const entity = this._entities[id];
      if (entity) {
        delete this._entities[id];
      }
    });

    entities.forEach((entity: T) => {
      this._entities[entity.id] = entity;
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
        }
      });
    } else {
      entities.forEach((entity, id) => {
        this._update(entity, id);
      });
    }
  }

  private _update(entity: T, id: number) {
    const oldEntity = this._entities[id];
    if (oldEntity) {
      this._updatePartial(oldEntity, entity);
    } else {
      this._entities[id] = entity;
    }
  }

  private _updatePartial(oldEntity: T, partialEntity: Partial<Raw<T>> | T) {
    Object.keys(partialEntity).forEach((key: string) => {
      oldEntity[key] = partialEntity[key];
    });
  }
}

export { EntityCacheController, CACHE_INITIAL_STATUS };
