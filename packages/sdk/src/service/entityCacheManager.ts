import _ from 'lodash';
import { BaseModel, Raw } from '../models';
import { CACHE_INITIAL_STATUS } from './constants';

class EntityCacheManager<T extends BaseModel = BaseModel> {
  private _entities: { [id: number]: T } = {};
  private _initialStatus: CACHE_INITIAL_STATUS;

  constructor() {
    this._initialStatus = CACHE_INITIAL_STATUS.NONE;
  }

  initialize(entities: T[]) {
    this._initialStatus = CACHE_INITIAL_STATUS.INPROGRESS;
    this.clear();
    _.forEach(entities, (model: T) => {
      this.set(model);
    });
    this._initialStatus = CACHE_INITIAL_STATUS.SUCCESS;
  }

  isInitialized() {
    return this._initialStatus === CACHE_INITIAL_STATUS.SUCCESS;
  }

  isStartInitial() {
    return this._initialStatus !== CACHE_INITIAL_STATUS.NONE;
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

  async getMultiEntities(ids: number[]) {
    const entities: T[] = [];
    ids.forEach((id: number) => {
      const entity = this.getEntity(id);
      if (entity) {
        entities.push(entity);
      }
    });
    return entities;
  }

  getEntity(id: number): T | null {
    return this._entities[id];
  }

  set(entity: T) {
    this._entities[entity.id] = entity;
  }

  clear() {
    this._entities = {};
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

  async update(
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

  async delete(ids: number[]) {
    ids.forEach((id: number) => {
      const entity = this._entities[id];
      if (entity) {
        delete this._entities[id];
      }
    });
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
      oldEntity[_.camelCase(key)] = partialEntity[key];
    });
  }
}

export default EntityCacheManager;
