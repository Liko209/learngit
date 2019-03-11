import _ from 'lodash';
import { onBecomeObserved, onBecomeUnobserved, action, observable } from 'mobx';
import { service } from 'sdk';
import { BaseService } from 'sdk/service';
import { IdModel, Raw } from 'sdk/framework/model';
import BaseStore from './BaseStore';
import ModelProvider from './ModelProvider';
import visibilityChangeEvent from './visibilityChangeEvent';
import { Entity, EntitySetting } from '../store';
import { ENTITY_NAME } from '../constants';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';

const modelProvider = new ModelProvider();
const { EVENT_TYPES } = service;

export default class MultiEntityMapStore<
  T extends IdModel,
  K extends Entity
> extends BaseStore {
  @observable.shallow
  private _data: { [id: number]: K } = {};
  private _usedIds: Set<number> = new Set();

  private _getService: Function | [Function, string];
  private _maxCacheCount: number;
  private _service: BaseService<T>;

  constructor(
    entityName: ENTITY_NAME,
    { service, event, cacheCount }: EntitySetting,
  ) {
    super(entityName);

    this._getService = service;
    this._maxCacheCount = cacheCount;
    const callback = (payload: NotificationEntityPayload<T>) => {
      this.handleIncomingData(payload);
    };
    event.forEach((eventName: string) => {
      this.subscribeNotification(eventName, callback);
    });
    visibilityChangeEvent(this._refreshCache.bind(this));
  }

  handleIncomingData(payload: NotificationEntityPayload<T>) {
    const existKeys: number[] = Object.keys(this._data).map(Number);
    switch (payload.type) {
      case EVENT_TYPES.RESET:
        this.reset();
        break;
      case EVENT_TYPES.RELOAD:
        this.reload();
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
            this.batchUpdate(partials);
          } else {
            entities.forEach((entity: T) => {
              this._partialUpdate(entity, entity.id);
            });
          }
        }
        break;
    }
  }

  @action
  set(data: T) {
    const model = this.createModel(data);
    const { id } = model;

    this._data[id] = model;
    this._registerHook(id);
  }

  @action
  batchUpdate(partials: Map<number, Partial<Raw<T>>>) {
    partials.forEach((partialEntity, id) => {
      this._partialUpdate(partialEntity, id);
    });
  }

  @action
  private _partialUpdate(partialEntity: Partial<Raw<T>> | T, id: number) {
    const model = this._data[id];
    if (model) {
      Object.keys(partialEntity).forEach((key: string) => {
        model[_.camelCase(key)] = partialEntity[key];
      });
      model.isMocked = false;
    }
  }

  @action
  batchSet(entities: T[]) {
    entities.forEach((entity: T) => {
      this._setOrUpdate(entity);
    });
  }

  @action
  batchReplace(entities: Map<number, T>) {
    entities.forEach((value: T, key: number) => {
      this._replace(key, value);
    });
  }

  @action
  private _replace(oldId: number, entity: T) {
    if (entity && this._data[oldId]) {
      this._setOrUpdate(entity);
    }
  }

  private _setOrUpdate(entity: T) {
    const model = this._data[entity.id];
    if (!model) {
      this.set(entity);
    } else {
      this._partialUpdate(entity, entity.id);
    }
  }

  @action
  remove(id: number) {
    setTimeout(() => {
      const model = this._data[id];
      if (model) {
        delete this._data[id];
      }
    },         0);
  }

  batchRemove(ids: number[]) {
    ids.forEach((id: number) => {
      this.remove(id);
    });
  }

  clearAll() {
    this._data = {};
  }

  get(id: number) {
    let model = this._data[id];
    if (!model) {
      this.set({ id, isMocked: true } as T);
      model = this._data[id] as K;
      const found = this.getByServiceSynchronously(id);
      if (found) {
        this._partialUpdate(found, id);
        model = this._data[id] as K;
      } else {
        const res = this.getByService(id);
        if (res instanceof Promise) {
          res.then((res: T & { error?: {} }) => {
            if (res && !res.error) {
              this._partialUpdate(res as T, id);
            }
          });
        } else {
          if (res) {
            this._partialUpdate(res as T, id);
            model = this._data[id] as K;
          }
        }
      }
    }

    return model;
  }

  has(id: number): boolean {
    return !!this._data[id];
  }

  hasValid(id: number): boolean {
    const model = this._data[id];
    return !!(model && !model.isMocked);
  }

  subtractedBy(ids: number[]) {
    const existingKeys = Object.keys(this._data).map(Number);
    return [_.difference(ids, existingKeys), _.intersection(ids, existingKeys)];
  }

  getSize() {
    return Object.keys(this._data).length;
  }

  getData() {
    return this._data;
  }

  getByService(id: number): Promise<T | null> | T {
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

  getByServiceSynchronously(id: number): T | null {
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
    this._usedIds.forEach((id: number) => {
      this._data[id].reset();
    });
  }

  @action
  reload() {
    this._usedIds.forEach((id: number) => {
      const found = this.getByServiceSynchronously(id);
      if (found) {
        this.set(found);
        return;
      }

      const res = this.getByService(id);
      if (res instanceof Promise) {
        res.then((res: T & { error?: {} }) => {
          if (res && !res.error) {
            this.set(res);
          }
        });
      } else {
        this.set(res as T);
      }
    });
  }

  private _registerHook(id: number) {
    onBecomeObserved(this._data, `${id}`, this._addUsedIds(id));
    onBecomeUnobserved(this._data, `${id}`, this._delUsedIds(id));
  }

  private _addUsedIds(id: number) {
    return () => {
      this._usedIds.add(id);
    };
  }

  private _delUsedIds(id: number) {
    return () => {
      this._usedIds.delete(id);
    };
  }

  private _refreshCache() {
    if (this.getSize() < this._maxCacheCount) {
      return;
    }
    const existKeys = Object.keys(this._data).map(Number);
    const diffKeys = _.difference(existKeys, [...this._usedIds]);
    this.batchRemove(diffKeys);
  }
}
