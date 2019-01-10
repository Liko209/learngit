import _ from 'lodash';
import { createAtom, IAtom, action } from 'mobx';
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
  private _data: { [id: number]: K } = {};
  private _atom: { [id: number]: IAtom } = {};
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
          payload.body.entities.forEach((entity: T) => {
            this._replace(entity);
          });
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

  set(data: T) {
    const model = this.createModel(data);
    const { id } = model;

    this._createAtom(id);
    this._data[id] = model;
    this._atom[id].reportChanged();
  }

  @action
  batchUpdate(partials: Map<number, Partial<Raw<T>>>) {
    partials.forEach((partialEntity, id) => {
      this._partialUpdate(partialEntity, id);
    });
  }

  private _partialUpdate(partialEntity: Partial<Raw<T>> | T, id: number) {
    const model = this._data[id];
    if (model) {
      Object.keys(partialEntity).forEach((key: string) => {
        model[_.camelCase(key)] = partialEntity[key];
      });
      model.isMocked = false;
    }
  }

  batchSet(entities: T[]) {
    entities.forEach((entity: T) => {
      const model = this._data[entity.id];
      if (!model) {
        this.set(entity);
      } else {
        this._partialUpdate(entity, entity.id);
      }
    });
  }

  batchReplace(entities: T[]) {
    entities.forEach((entity: T) => {
      this._replace(entity);
    });
  }

  private _replace(entity: T) {
    if (entity && this._data[entity.id]) {
      this._partialUpdate(entity, entity.id);
    }
  }

  remove(id: number) {
    const model = this._data[id];
    if (model) {
      delete this._data[id];
      delete this._atom[id];
    }
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

    this._atom[id].reportObserved();
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

  getByService(id: number): Promise<T | null> {
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

  private _createAtom(id: number) {
    let atom = this._atom[id];
    if (!atom) {
      const name = `${this.name}:${id}`;
      atom = createAtom(name, this._addUsedIds(id), this._delUsedIds(id));
      this._atom[id] = atom;
    }
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
