import _ from 'lodash';
import { action, toJS, transaction, ObservableMap, observable } from 'mobx';
import BaseStore from './BaseStore';
import ModelProvider from './ModelProvider';
import visibilityChangeEvent from './visibilityChangeEvent';
import { ENTITY_EVENT_NAME, ENTITY_CACHE_COUNT } from './constants';
import { IIncomingData } from '../store';
import { BaseService } from 'sdk/service';
import { BaseModel } from 'sdk/models';
import Base from '@/store/models/Base';

const modelProvider = new ModelProvider();

export default class MultiEntityMapStore<T extends BaseModel, K extends Base<T>> extends BaseStore {
  data: ObservableMap = observable.map(new Map(), { deep: false });
  usedIds: Map<any, Set<number>> = new Map();

  getService: Function | [Function, string];
  maxCacheCount: number;
  service: BaseService<T>;

  constructor(entityName: string, getService: Function | [Function, string]) {
    super(entityName);

    this.getService = getService;
    this.maxCacheCount = ENTITY_CACHE_COUNT[entityName];
    const callback = ({ type, entities }: IIncomingData<T>) => {
      this.handleIncomingData({ type, entities });
    };
    ENTITY_EVENT_NAME[entityName].forEach((eventName: string) => {
      this.subscribeNotification(eventName, callback);
    });
    visibilityChangeEvent(this.refreshCache.bind(this));
  }

  handleIncomingData({ type, entities }: IIncomingData<T>) {
    if (!entities.size) {
      return;
    }
    const existKeys: number[] = Array.from(this.data.keys());
    const matchedKeys: number[] = _.intersection(Array.from(entities.keys()), existKeys);
    if (type !== 'delete') {
      //   this.batchRemove(matchedKeys);
      // } else {
      const matchedEntities: T[] = [];
      matchedKeys.forEach((key: number) => {
        const entity = entities.get(key);
        if (entity) {
          matchedEntities.push(entity);
        }
      });
      if (type === 'update') {
        this.batchDeepSet(matchedEntities as any);
        return;
      }
      if (type === 'replace') {
        this.batchReplace(matchedEntities as any);
        return;
      }
      this.batchSet(matchedEntities as any);
    }
  }

  @action
  set(data: T) {
    const model = this.createModel(data);
    const { id } = model;

    this.data.set(id, model);
  }

  @action
  batchSet(entities: K[]) {
    if (!entities.length) {
      return;
    }
    const handledModels = new Map();
    entities.forEach((value) => {
      const model = this.createModel(value);
      const { id } = model;
      handledModels.set(id, model);
    });
    this.data.merge(handledModels);
  }

  @action
  batchDeepSet(entities: K[]) {
    if (!entities.length) {
      return;
    }
    const handledModels = new Map();
    entities.forEach((entity) => {
      const { id } = entity;
      const obs = this.get(id);
      const model = this.createModel(obs ? _.merge(toJS(obs), entity) : entity);
      handledModels.set(id, model);
    });
    this.data.merge(handledModels);
  }

  @action
  batchReplace(entities: K[]) {
    if (!entities.length) {
      return;
    }
    const handledModels = new Map();
    entities.forEach((entity) => {
      const { id, data } = entity;
      this.remove(id);
      const model = this.createModel(data);
      handledModels.set(model.id, model);
    });
    this.data.merge(handledModels);
  }

  @action
  remove(id: number) {
    const model = this.get(id);
    if (model) {
      this.data.delete(id);
      if (model.dispose) {
        model.dispose();
      }
    }
  }

  @action
  batchRemove(ids: number[]) {
    transaction(() =>
      ids.forEach((id) => {
        this.remove(id);
      }),
    );
  }

  get(id: number): K {
    let model = this.data.get(id);
    if (!model) {
      this.set({ id } as T);
      model = this.data.get(id);
      const res = this.getByService(id);
      if (res instanceof Promise && typeof res.then === 'function') {
        res.then((res: T & { error?: {} }) => {
          if (res && !res.error) {
            this.set(res);
          }
        });
      } else {
        this.set(res as T);
        model = this.data.get(id);
      }
    }
    return model;
  }

  has(id: number): boolean {
    return this.data.has(id);
  }

  first(): K | {} {
    if (this.getSize() > 0) {
      const firstKey = this.data.keys().next().value;
      return this.get(firstKey);
    }
    return {};
  }

  getSize() {
    return this.data.size;
  }

  getByService(id: number): Promise<T> | T {
    if (!this.service) {
      if (Array.isArray(this.getService)) {
        this.service = this.getService[0]();
      } else {
        this.service = this.getService();
      }
    }
    if (Array.isArray(this.getService)) {
      return this.service[this.getService[1]](id);
    }
    return this.service.getById(id);
  }

  createModel(model: T | K): K {
    const Model = modelProvider.getModelCreator<K>(this.name);
    return Model.fromJS(model);
  }

  addUsedIds(key: any, id: number) {
    const usedIds = this.usedIds.get(key);
    if (usedIds) {
      usedIds.add(id);
    } else {
      this.usedIds.set(key, new Set([id]));
    }
  }

  delUsedIds(key: any) {
    return this.usedIds.delete(key);
  }

  refreshCache() {
    const usedIds: number[] = [];
    this.usedIds.forEach((ids) => {
      usedIds.push(...ids);
    });
    const existKeys = Array.from(this.data.keys());
    const diffKeys = _.difference(existKeys, [...(new Set(usedIds))]);
    this.batchRemove(diffKeys);
  }
}
