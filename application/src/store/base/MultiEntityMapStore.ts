import _ from 'lodash';
import { onBecomeObserved, onBecomeUnobserved, action, observable } from 'mobx';
import { service, mainLogger } from 'sdk';
import { IdModel, ModelIdType, Raw } from 'sdk/framework/model';
import BaseStore from './BaseStore';
import ModelProvider from './ModelProvider';
import visibilityChangeEvent from './visibilityChangeEvent';
import { Entity, EntitySetting } from '../store';
import { ENTITY_NAME } from '../constants';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import IUsedCache from './IUsedCache';
import { EntityBaseService } from 'sdk/framework/service';

const modelProvider = new ModelProvider();
const { EVENT_TYPES } = service;

export default class MultiEntityMapStore<
  T extends IdModel<IdType>,
  K extends Entity<IdType>,
  IdType extends ModelIdType = number
> extends BaseStore {
  @observable.shallow
  private _data: { [id: string]: K } = {};
  private _usedIds: Set<IdType> = new Set();

  private _getService: Function | [Function, string];
  private _maxCacheCount: number;
  private _service: EntityBaseService<T, IdType>;

  private _usedCacheArr: IUsedCache<IdType>[] = [];

  private _modelCreator: ((model: IdModel<IdType>) => K) | undefined;

  constructor(
    entityName: ENTITY_NAME,
    { service, event, cacheCount, modelCreator }: EntitySetting<K, IdType>,
  ) {
    super(entityName);

    this._getService = service;
    this._maxCacheCount = cacheCount;
    this._modelCreator = modelCreator;

    const callback = (payload: NotificationEntityPayload<T, IdType>) => {
      this.handleIncomingData(payload);
    };
    event.forEach((eventName: string) => {
      this.subscribeNotification(eventName, callback);
    });
    visibilityChangeEvent(this._refreshCache.bind(this));
  }

  private _getDataKeys(): IdType[] {
    return Object.values(this._data).map((value: K) => {
      return value.id;
    });
  }

  handleIncomingData(payload: NotificationEntityPayload<T, IdType>) {
    const existKeys: IdType[] = this._getDataKeys();
    switch (payload.type) {
      case EVENT_TYPES.RESET:
        {
          this.reset();
        }
        break;

      case EVENT_TYPES.RELOAD:
        {
          this.reload();
        }
        break;

      case EVENT_TYPES.DELETE:
        {
          const matchedKeys = _.intersection(payload.body.ids, existKeys);
          this.batchRemove(matchedKeys);
        }
        break;
      case EVENT_TYPES.REPLACE:
        {
          this.batchReplace(payload.body.entities);
        }
        break;
      case EVENT_TYPES.UPDATE:
        {
          const partials = payload.body.partials;
          const entities = payload.body.entities;
          if (partials) {
            this.batchPartialUpdate(partials);
          } else {
            this.batchUpdate(entities);
          }
        }
        break;
    }
  }

  @action
  batchPartialUpdate(partials: Map<IdType, Partial<Raw<T>>>) {
    partials.forEach((partialEntity, id) => {
      this._partialUpdate(partialEntity, id);
    });
  }

  @action
  batchUpdate(partials: Map<IdType, T>) {
    partials.forEach((partialEntity, id) => {
      this._partialUpdate(partialEntity, id);
    });
  }

  @action
  partialUpdate(partialEntity: Partial<Raw<T>> | T, id: IdType) {
    this._partialUpdate(partialEntity, id);
  }

  private _partialUpdate(partialEntity: Partial<Raw<T>> | T, id: IdType) {
    const model = this._data[id];
    if (model) {
      Object.keys(partialEntity).forEach((key: string) => {
        const camelCaseKey = _.camelCase(key);
        if (model.hasOwnProperty(camelCaseKey)) {
          model[camelCaseKey] = partialEntity[key];
        }
      });
      model.isMocked = false;
    }
  }

  @action
  set(data: T, refreshCache: boolean = false) {
    this._set(data, refreshCache);
    this._refreshCache();
  }

  @action
  batchSet(entities: T[], refreshCache = true) {
    entities.forEach((entity: T) => {
      this._setOrUpdate(entity);
    });

    refreshCache && this._refreshCache();
  }

  private _set(data: T, refreshCache: boolean = false) {
    let model: K;
    if (this._modelCreator) {
      model = this._modelCreator(data);
    } else {
      model = this.createModel(data);
    }

    const { id } = model;

    this._data[id] = model;
    this._registerHook(id);

    if (refreshCache) {
      this._refreshCache();
    }
  }

  @action
  batchReplace(entities: Map<IdType, T>) {
    entities.forEach((value: T, key: IdType) => {
      this._replace(key, value);
    });
  }

  private _replace(oldId: IdType, entity: T) {
    if (entity && this._data[oldId]) {
      this._setOrUpdate(entity);
    }
  }

  private _setOrUpdate(entity: T) {
    const model = this._data[entity.id];
    if (!model) {
      this._set(entity);
    } else {
      this._partialUpdate(entity, entity.id);
    }
  }

  @action
  remove(id: IdType) {
    setTimeout(() => {
      delete this._data[id];
    },         0);
  }

  @action
  batchRemove(ids: IdType[]) {
    setTimeout(() => {
      ids.forEach((id: IdType) => {
        delete this._data[id];
      });
    },         0);
  }

  @action
  clearAll() {
    this._data = {};
  }

  get(id: IdType) {
    let model = this._data[id];
    if (!model) {
      this.set({ id, isMocked: true } as T);
      model = this._data[id] as K;
      const found = this.getByServiceSynchronously(id);
      if (found) {
        this.partialUpdate(found, id);
        model = this._data[id] as K;
      } else {
        const res = this.getByService(id);
        if (res instanceof Promise) {
          res
            .then((res: T & { error?: {} }) => {
              if (res && !res.error) {
                this.partialUpdate(res as T, id);
              }
            })
            .catch(error => {
              mainLogger.log('MultiEntityMapStore get error', error);
            });
        } else {
          if (res) {
            this.partialUpdate(res as T, id);
            model = this._data[id] as K;
          }
        }
      }
    }

    return model;
  }

  has(id: IdType): boolean {
    return !!this._data[id];
  }

  hasValid(id: IdType): boolean {
    const model = this._data[id];
    return !!(model && !model.isMocked);
  }

  subtractedBy(ids: IdType[]) {
    const existingKeys: IdType[] = this._getDataKeys();
    return [_.difference(ids, existingKeys), _.intersection(ids, existingKeys)];
  }

  getSize() {
    return Object.keys(this._data).length;
  }

  getData() {
    return this._data;
  }

  getByService(id: IdType): Promise<T | null> | T {
    if (!this._service) {
      if (Array.isArray(this._getService)) {
        this._service = this._getService[0]();
      } else {
        this._service = this._getService();
      }
    }
    if (Array.isArray(this._getService)) {
      return this._service[this._getService[1]](id);
    }

    return this._service.getById(id);
  }

  getByServiceSynchronously(id: IdType): T | null {
    if (this._service && this._service.getSynchronously) {
      return this._service.getSynchronously(id);
    }

    return null;
  }

  createModel(model: T | K): K {
    const Model = modelProvider.getModelCreator(this.name);
    return Model.fromJS(model);
  }

  getUsedIds() {
    return this._usedIds;
  }

  @action
  reset() {
    this._usedIds.forEach((id: IdType) => {
      const singleData = this._data[id];
      if (singleData && singleData.reset) {
        singleData.reset();
      }
    });
  }

  @action
  reload() {
    this._usedIds.forEach((id: IdType) => {
      const found = this.getByServiceSynchronously(id);
      if (found) {
        this.set(found);
        return;
      }

      const res = this.getByService(id);
      if (res instanceof Promise) {
        res.then((res: T & { error?: {} }) => {
          if (res && !res.error) {
            this._set(res);
          }
        });
      } else {
        this._set(res as T);
      }
    });
  }

  addUsedCache(cache: IUsedCache<IdType>) {
    this._usedCacheArr.push(cache);
  }

  removeUsedCache(cache: IUsedCache<IdType>) {
    _.remove(
      this._usedCacheArr,
      (element: IUsedCache<IdType>) => element === cache,
    );
  }

  private _registerHook(id: IdType) {
    onBecomeObserved(this._data, `${id}`, this._addUsedIds(id));
    onBecomeUnobserved(this._data, `${id}`, this._delUsedIds(id));
  }

  private _addUsedIds(id: IdType) {
    return () => {
      this._usedIds.add(id);
    };
  }

  private _delUsedIds(id: IdType) {
    return () => {
      this._usedIds.delete(id);
    };
  }

  private _refreshCache() {
    if (this.getSize() < this._maxCacheCount || !this._getIsHidden()) {
      return;
    }

    setTimeout(() => {
      const existKeys: IdType[] = this._getDataKeys();
      let allUsedIds = [...this._usedIds];
      this._usedCacheArr.forEach((cache: IUsedCache<IdType>) => {
        allUsedIds = _.union(allUsedIds, cache.getUsedIds());
      });
      const diffKeys = _.difference(existKeys, allUsedIds);
      diffKeys.forEach((id: IdType) => {
        delete this._data[id];
      });
    },         100);
  }

  private _getIsHidden() {
    return (
      document['hidden'] || document['msHidden'] || document['webkitHidden']
    );
  }
}
