import _ from 'lodash';
import { observable, action, ObservableMap } from 'mobx';
import BaseStore from './BaseStore';
import ModelProvider from './ModelProvider';
import { Entity, EntitySetting } from '../store';
import { ENTITY_NAME } from '../constants';
import { BaseService, EVENT_TYPES } from 'sdk/service';
import { IdModel } from 'sdk/framework/model';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';

const modelProvider = new ModelProvider();

export default class SingleEntityMapStore<
  T extends IdModel,
  K extends Entity
> extends BaseStore {
  @observable
  data: ObservableMap = new ObservableMap<keyof Entity, any>();
  init: boolean;
  getService: Function;
  service: BaseService<T>;
  constructor(entityName: ENTITY_NAME, { service, event }: EntitySetting<K>) {
    super(entityName);
    this.init = false;
    this.getService = service as Function;

    const callback = (payload: NotificationEntityPayload<T>) => {
      this.handleIncomingData(payload);
    };
    event.forEach((eventName: string) => {
      this.subscribeNotification(eventName, callback);
    });
  }

  handleIncomingData(payload: NotificationEntityPayload<T>) {
    if (payload.type !== EVENT_TYPES.UPDATE) {
      return;
    }
    const entities = payload.body!.entities!;
    const entity = {};
    Array.from(entities.values()).forEach((value: T) => {
      _.merge(entity, value);
    });

    this.batchSet(entity as T);
  }

  @action
  set(property: keyof Entity, value: any) {
    this.data.set(property, value);
  }

  @action
  batchSet(data: T) {
    if (!Object.keys(data).length) {
      return;
    }
    const model = this.createModel(data);
    this.data.merge(model.toJS ? model.toJS() : model);
  }

  get(property: keyof K) {
    if (!this.init) {
      this.init = true;
      this.getByService().then((data: any) => {
        if (data) {
          this.batchSet(data);
        } else {
          this.init = false;
        }
      });
    }
    return this.data.get(property);
  }

  has(property: keyof Entity) {
    return this.data.has(property);
  }

  getSize() {
    return this.data.size;
  }

  getByService() {
    if (!this.service) {
      this.service = this.getService();
    }
    const serviceFunctionName = `get${_.upperFirst(this.name)}`;
    return this.service[serviceFunctionName]();
  }

  createModel(data: T): Entity {
    const Model = modelProvider.getModelCreator(this.name);
    return Model.fromJS(data);
  }
}
