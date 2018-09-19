import _ from 'lodash';
import { createAtom, IAtom } from 'mobx';
import { service } from 'sdk';
import { BaseService } from 'sdk/service';
import { BaseModel } from 'sdk/models';

import BaseStore from './BaseStore';
import ModelProvider from './ModelProvider';
import visibilityChangeEvent from './visibilityChangeEvent';
import { IIncomingData, IEntity, IEntitySetting } from '../store';
import { ENTITY_NAME } from '../constants';

const modelProvider = new ModelProvider();
const { EVENT_TYPES } = service;

export default class MultiEntityMapStore<
  T extends BaseModel,
  K extends IEntity
> extends BaseStore {
  private _data: { [id: number]: K } = {};
  private _atom: { [id: number]: IAtom } = {};
  private _usedIds: Set<number> = new Set();

  private _getService: Function | [Function, string];
  private _maxCacheCount: number;
  private _service: BaseService<T>;

  constructor(
    entityName: ENTITY_NAME,
    { service, event, cacheCount }: IEntitySetting,
  ) {
    super(entityName);

    this._getService = service;
    this._maxCacheCount = cacheCount;
    const callback = ({ type, entities }: IIncomingData<T>) => {
      this.handleIncomingData({ type, entities });
    };
    event.forEach((eventName: string) => {
      this.subscribeNotification(eventName, callback);
    });
    visibilityChangeEvent(this._refreshCache.bind(this));
  }

  handleIncomingData({ type, entities }: IIncomingData<T>) {
    if (!entities.size) {
      return;
    }
    const existKeys: number[] = Object.keys(this._data).map(Number);
    const matchedKeys: number[] = _.intersection(
      Array.from(entities.keys()),
      existKeys,
    );
    if (type === EVENT_TYPES.DELETE) {
      this.batchRemove(matchedKeys);
    } else {
      const matchedEntities: (T | { id: number; data: T })[] = [];
      matchedKeys.forEach((key: number) => {
        const entity = entities.get(key);
        if (entity) {
          matchedEntities.push(entity);
        }
      });
      if (type === EVENT_TYPES.UPDATE) {
        this.batchDeepSet(matchedEntities as T[]);
        return;
      }
      if (type === EVENT_TYPES.REPLACE) {
        this.batchReplace(matchedEntities as { id: number; data: T }[]);
        return;
      }
      this.batchSet(matchedEntities as T[]);
    }
  }

  set(data: T) {
    const model = this.createModel(data);
    const { id } = model;

    this._createAtom(id);
    this._data[id] = model;
    this._atom[id].reportChanged();
  }

  batchSet(entities: T[]) {
    if (!entities.length) {
      return;
    }
    entities.forEach((entity: T) => {
      this.set(entity);
    });
  }

  batchDeepSet(entities: T[]) {
    if (!entities.length) {
      return;
    }
    entities.forEach((entity: T) => {
      const { id } = entity;
      const obs = this.get(id);
      const model = _.merge(obs, this.createModel(entity));
      this._data[id] = model;
      this._atom[id].reportChanged();
    });
  }

  batchReplace(entities: { id: number; data: T }[]) {
    if (!entities.length) {
      return;
    }
    entities.forEach((entity: { id: number; data: T }) => {
      const { id, data } = entity;
      this.remove(id);
      this.set(data);
    });
  }

  remove(id: number) {
    const model = this.get(id);
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
      this.set({ id } as T);
      model = this._data[id] as K;
      const res = this.getByService(id);
      if (res instanceof Promise) {
        res.then((res: T & { error?: {} }) => {
          if (res && !res.error) {
            this.set(res);
          }
        });
      } else {
        this.set(res as T);
        model = this._data[id] as K;
      }
    }

    this._atom[id].reportObserved();
    return model;
  }

  has(id: number): boolean {
    return !!this._data[id];
  }

  getSize() {
    return Object.keys(this._data).length;
  }

  getData() {
    return this._data;
  }

  getByService(id: number): Promise<T> | T {
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
