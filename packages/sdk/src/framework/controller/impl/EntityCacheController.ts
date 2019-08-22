/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 15:16:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IEntityCacheController } from '../interface/IEntityCacheController';
import { IdModel, Raw, ModelIdType } from '../../model';

enum CACHE_INITIAL_STATUS {
  NONE,
  INPROGRESS,
  SUCCESS,
}

class EntityCacheController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> implements IEntityCacheController<T, IdType> {
  protected _entities: Map<IdType, T> = new Map(); // { [id: IdType]: T } = {};

  private _initialStatus: CACHE_INITIAL_STATUS;

  constructor(private _entityName?: string) {
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

  async put(item: T): Promise<void> {
    if (item) {
      this.putInternal(item);
    }
  }

  async bulkPut(array: T[]): Promise<void> {
    array.forEach((item: T) => {
      if (item) {
        this.putInternal(item);
      }
    });
  }

  async clear(): Promise<void> {
    this._entities.clear();
  }

  async delete(key: IdType): Promise<void> {
    this.deleteInternal(key);
  }

  async bulkDelete(keys: IdType[]): Promise<void> {
    keys.forEach((key: IdType) => {
      this.deleteInternal(key);
    });
  }

  async update(item: Partial<T>): Promise<void> {
    this._updatePartially(item);
  }

  async bulkUpdate(array: Partial<T>[]): Promise<void> {
    this._updatePartially(array);
  }

  async get(key: IdType): Promise<T | null> {
    return this.getSynchronously(key);
  }

  getSynchronously(key: IdType): T | null {
    const result = this._entities.get(key);
    return result ? result : null;
  }

  async batchGet(ids: IdType[]): Promise<T[]> {
    const entities: T[] = [];

    ids.forEach((id: IdType) => {
      const entity = this.getSynchronously(id);
      if (entity) {
        entities.push(entity);
      }
    });

    return entities;
  }

  getEntityName(): string {
    return this._entityName || '';
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

  async getEntities(
    filterFunc?: (entity: T) => boolean,
    sortFunc?: (entityA: T, entityB: T) => number,
  ): Promise<T[]> {
    let values = await this.getAll();
    if (filterFunc) {
      values = values.filter(entity => filterFunc(entity));
    }

    if (sortFunc && values.length) {
      values.sort(sortFunc);
    }

    return values;
  }

  async replace(ids: IdType[], entities: Map<IdType, T>) {
    ids.forEach((id: IdType) => {
      this.deleteInternal(id);
    });

    entities.forEach((entity: T) => {
      this.putInternal(entity);
    });
  }

  async updateEx(
    entities: Map<IdType, T>,
    partials?: Map<IdType, Partial<Raw<T>>>,
  ) {
    if (partials) {
      partials.forEach((partialModel, id) => {
        const oldEntity = this._entities.get(id);
        if (oldEntity) {
          this.updatePartial(oldEntity, partialModel);
        } else {
          const partialObject: {} = partialModel;
          this._entities.set(id, partialObject as T);
        }
      });
    } else {
      entities.forEach((entity, id) => {
        this._update(entity, id);
      });
    }
  }

  private _update(entity: T, id: IdType) {
    const oldEntity = this._entities.get(id);
    if (oldEntity) {
      this.updatePartial(oldEntity, entity);
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

  protected deleteInternal(key: IdType) {
    if (this._entities.has(key)) {
      this._entities.delete(key);
    }
  }

  protected putInternal(item: T) {
    this._entities.set(item.id, item);
  }

  protected updatePartial(oldEntity: T, partialEntity: Partial<Raw<T>> | T) {
    Object.keys(partialEntity).forEach((key: string) => {
      oldEntity[key] = partialEntity[key];
    });
  }
}

export { EntityCacheController, CACHE_INITIAL_STATUS };
