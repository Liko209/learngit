/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-05-10 10:55:24
* Copyright © RingCentral. All rights reserved.
*/
import faker from 'faker';
import { service } from 'sdk';
import MultiEntityMapStore from '../MultiEntityMapStore';
import BaseStore from '../BaseStore';
import { ENTITY_SETTING } from '../../config';
import { ENTITY_NAME } from '../../constants';
import { IEntity, IIncomingData } from '../../store';
import { BaseModel } from 'sdk/models';
const { EVENT_TYPES } = service;

// jest.mock('../ModelProvider');
const instance: MultiEntityMapStore<any, any> = new MultiEntityMapStore(
  ENTITY_NAME.POST,
  ENTITY_SETTING[ENTITY_NAME.POST],
);
const getEntity: (i?: number) => IEntity = (i?: number) => ({
  id: i || faker.random.number(10),
});
const getEntityArray: (n?: number) => IEntity[] = (n?: number) => {
  const arr: IEntity[] = [];
  for (let i = 1; i <= (n || faker.random.number(10)); i += 1) {
    arr.push(getEntity(i));
  }
  return arr;
};
const getEntityMap: (n?: number) => Map<number, IEntity> = (n?: number) => {
  const map: Map<number, IEntity> = new Map<number, IEntity>();
  for (let i = 1; i <= (n || faker.random.number(10)); i += 1) {
    map.set(i, getEntity(i));
  }
  return map;
};

describe('handleIncomingData()', () => {
  const entities = getEntityMap(10);
  const entitiesArray = getEntityArray(5);
  beforeEach(() => {
    instance.batchSet(entitiesArray);
  });

  afterEach(() => {
    instance.clearAll();
  });

  it('for put type', () => {
    const data: IIncomingData<BaseModel> = {
      entities,
      type: EVENT_TYPES.PUT,
    };
    instance.handleIncomingData(data);

    const models = instance.getData();

    expect(Object.keys(models)).toHaveLength(5);
  });

  it('for update type', () => {
    const data: IIncomingData<BaseModel> = {
      entities,
      type: EVENT_TYPES.UPDATE,
    };
    instance.handleIncomingData(data);

    const models = instance.getData();

    expect(Object.keys(models)).toHaveLength(5);
  });

  it('for delete type', () => {
    const data: IIncomingData<BaseModel> = {
      entities,
      type: EVENT_TYPES.DELETE,
    };
    instance.handleIncomingData(data);

    const models = instance.getData();

    expect(Object.keys(models)).toHaveLength(0);
  });
});

describe('get()', () => {
  instance.get(1);
  const models = instance.getData();
  expect(Object.keys(models)).toHaveLength(1);
  expect(Object.keys(models).includes('1')).toBeTruthy();
});
