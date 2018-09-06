import _ from 'lodash';
import { observable, action, ObservableMap } from 'mobx';
import BaseStore from './BaseStore';
import ModelProvider from './ModelProvider';
import { ENTITY_EVENT_NAME, ENTITY_NAME } from './constants';
import { IIncomingData } from '../store';
import BaseService from 'sdk/service/BaseService';
import { BaseModel } from 'sdk/models';
import Base from '@/store/models/Base';

const modelProvider = new ModelProvider();

export default class SingleEntityMapStore<T extends BaseModel, K extends Base<T>> extends BaseStore {
  @observable data: ObservableMap = new ObservableMap<keyof K, any>();
  init: boolean;
  getService: Function;
  service: BaseService<T>;
  constructor(entityName: string, getService: Function) {
    super(entityName);

    this.init = false;
    this.getService = getService;

    const callback = ({ type, entities }: IIncomingData<T>) => {
      this.handleIncomingData({ type, entities });
    };
    ENTITY_EVENT_NAME[entityName].forEach((eventName: ENTITY_NAME) => {
      this.subscribeNotification(eventName, callback);
    });
  }

  handleIncomingData({ type, entities }: IIncomingData<T>) {
    if (!entities.size) {
      return;
    }
    const existProperties = Array.from(this.data.keys());
    const entity = {};
    Array.from(entities.values()).forEach((value: T) => {
      _.merge(entity, value);
    });

    const matchedProperties: (keyof K)[] = _.intersection(
      Object.keys(entity).map(property => _.camelCase(property)),
      existProperties,
    );

    if (!matchedProperties.length) {
      return;
    }
    if (type === 'delete') {
      this.batchRemove(matchedProperties);
    } else {
      this.batchSet(entity as T, matchedProperties);
    }
  }

  @action
  set(property: keyof K, value: any) {
    this.data.set(property, value);
  }

  @action
  batchSet(data: T, matchedProperties?: (keyof K)[]) {
    if (!Object.keys(data).length) {
      return;
    }
    let model = this.createModel(data);
    if (matchedProperties) {
      model = matchedProperties.reduce(
        (matchedModel: K, property: keyof K) => {
          matchedModel[property] = model[property]; // eslint-disable-line
          return matchedModel;
        },
        {},
      ) as K;
    }
    this.data.merge(model.toJS ? model.toJS() : model);
  }

  @action
  remove(property: keyof K) {
    this.data.delete(property);
  }

  @action
  batchRemove(properties: (keyof K)[]) {
    properties.forEach((property) => {
      this.remove(property);
    });
  }

  get(property: keyof K) {
    if (!this.init) {
      this.init = true;
      this.getByService().then((data: any) => {
        if (data) {
          this.batchSet(data);
        }
      });
    }
    return this.data.get(property);
  }

  has(property: keyof K) {
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

  createModel(data: T): K {
    const Model = modelProvider.getModelCreator<K>(this.name);
    return Model.fromJS(data);
  }
}
