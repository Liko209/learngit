import _ from 'lodash';
import { observable, action, ObservableMap } from 'mobx';
import BaseStore from './BaseStore';
import ModelProvider from './ModelProvider';
import { ENTITY_EVENT_NAME } from './constants';

const modelProvider = new ModelProvider();

export default class SingleEntityMapStore extends BaseStore {
  @observable data: ObservableMap = new ObservableMap();
  init: boolean;
  getService: Function;
  service: object;
  constructor(entityName: string, getService: Function) {
    super(entityName);

    this.init = false;
    this.getService = getService;

    const callback = ({ type, entities }: IIncomingData) => {
      this.handleIncomingData({ type, entities });
    };
    ENTITY_EVENT_NAME[entityName].forEach((eventName) => {
      this.subscribeNotification(eventName, callback);
    });
  }

  handleIncomingData({ type, entities }: IIncomingData) {
    if (!entities.size) {
      return;
    }
    const existProperties = Array.from(this.data.keys());
    const entity = {};
    Array.from(entities.values()).forEach((value) => {
      _.merge(entity, value);
    });

    const matchedProperties = _.intersection(
      Object.keys(entity).map(property => _.camelCase(property)),
      existProperties,
    );

    if (!matchedProperties.length) {
      return;
    }
    if (type === 'delete') {
      this.batchRemove(matchedProperties);
    } else {
      this.batchSet(entity, matchedProperties);
    }
  }

  @action
  set(property: string, value: any) {
    this.data.set(property, value);
  }

  @action
  batchSet(data: object, matchedProperties?: string[]) {
    if (!Object.keys(data).length) {
      return;
    }
    let model = this.createModel(data);
    if (matchedProperties) {
      model = matchedProperties.reduce(
        (matchedModel, property) => {
          matchedModel[property] = model[property];
          return matchedModel;
        },
        {},
      );
    }
    this.data.merge(model);
  }

  @action
  remove(property: string) {
    this.data.delete(property);
  }

  @action
  batchRemove(properties: string[]) {
    properties.forEach((property) => {
      this.remove(property);
    });
  }

  get(property: string) {
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

  has(property: string) {
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

  createModel(data: object) {
    const Model = modelProvider.getModelCreator(this.name);
    return Model.fromJS(data);
  }
}
