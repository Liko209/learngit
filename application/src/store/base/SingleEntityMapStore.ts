import _ from 'lodash';
import { observable, action, ObservableMap } from 'mobx';
import BaseStore from './BaseStore';
import ModelProvider from './ModelProvider';
import { IIncomingData, IEntity, IEntitySetting } from '../store';
import { ENTITY_NAME } from '../constants';
import BaseService from 'sdk/service/BaseService';
import { BaseModel } from 'sdk/models';

const modelProvider = new ModelProvider();

export default class SingleEntityMapStore<
  T extends BaseModel,
  K extends IEntity
> extends BaseStore {
  @observable
  data: ObservableMap = new ObservableMap<keyof IEntity, any>();
  init: boolean;
  getService: Function;
  service: BaseService<T>;
  constructor(entityName: ENTITY_NAME, { service, event }: IEntitySetting) {
    super(entityName);
    this.init = false;
    this.getService = service as Function;

    const callback = ({ type, entities }: IIncomingData<T>) => {
      this.handleIncomingData({ type, entities });
    };
    event.forEach((eventName: string) => {
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

    const matchedProperties: (keyof IEntity)[] = _.intersection(
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
  set(property: keyof IEntity, value: any) {
    this.data.set(property, value);
  }

  @action
  batchSet(data: T, matchedProperties?: (keyof IEntity)[]) {
    if (!Object.keys(data).length) {
      return;
    }
    let model = this.createModel(data);
    if (matchedProperties) {
      model = matchedProperties.reduce(
        (matchedModel: IEntity, property: keyof IEntity) => {
          matchedModel[property] = model[property]; // eslint-disable-line
          return matchedModel;
        },
        {},
      ) as IEntity;
    }
    this.data.merge(model.toJS ? model.toJS() : model);
  }

  @action
  remove(property: keyof IEntity) {
    this.data.delete(property);
  }

  @action
  batchRemove(properties: (keyof IEntity)[]) {
    properties.forEach((property: any) => {
      this.remove(property);
    });
  }

  get(property: keyof K) {
    if (!this.init) {
      this.getByService().then((data: any) => {
        if (data) {
          this.batchSet(data);
          this.init = true;
        }
      });
    }
    return this.data.get(property);
  }

  has(property: keyof IEntity) {
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

  createModel(data: T): IEntity {
    const Model = modelProvider.getModelCreator(this.name);
    return Model.fromJS(data);
  }
}
