/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-10 10:55:24
 * Copyright © RingCentral. All rights reserved.
 */
import faker from 'faker';
import { EVENT_TYPES } from 'sdk/service';
import BaseStore from '../BaseStore';
import { ENTITY_SETTING } from '../../config';
import ModelProvider from '../ModelProvider';
import SingleEntityMapStore from '../SingleEntityMapStore';
import { Entity } from '../../store';
import { ENTITY_NAME } from '../../constants';

jest.mock('../ModelProvider');

jest.mock('../BaseStore');

let instance: SingleEntityMapStore<any, any>;
const getService = () => {};
const getEntity: (i?: number) => Entity = (i?: number) => ({
  id: i || faker.random.number(10),
});
const getEntityMap: (n?: number) => Map<number, Entity> = (n?: number) => {
  const map: Map<number, Entity> = new Map<number, Entity>();
  for (let i = 0; i < (n || faker.random.number(10)); i += 1) {
    map.set(i, getEntity(i));
  }
  return map;
};
beforeAll(() => {
  ENTITY_SETTING['name'] = {};
  ENTITY_SETTING['name'].event = ['DELETE', 'PUT', 'UPDATE'];
  ENTITY_SETTING['name'].service = getService;
  instance = new SingleEntityMapStore(
    'name' as ENTITY_NAME,
    ENTITY_SETTING['name'],
  );
});

describe('SingleEntityMapStore constructor', () => {
  it('should call super constructor', () => {
    expect(BaseStore).toHaveBeenCalledTimes(1);
  });

  it('instance should have expected properties', () => {
    expect(instance).toHaveProperty('getService', getService);
  });

  it('should call subscribe on each event name', () => {
    expect(instance.subscribeNotification).toHaveBeenCalledTimes(3);
  });
});

describe('handleIncomingData()', () => {
  beforeEach(() => {
    jest.spyOn(instance, 'batchSet');
    jest.spyOn(instance.data, 'keys').mockImplementation(() => ['existing']);
  });

  afterEach(() => {
    (instance.batchSet as jest.Mock).mockReset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return if entities is empty', () => {
    const data: IncomingData<any> = {
      type: EVENT_TYPES.DELETE,
      body: [],
    };
    instance.handleIncomingData(data);

    expect(instance.batchSet).not.toHaveBeenCalled();
  });

  it('should return if no matched properties', () => {
    const body = {
      entities: getEntityMap(3),
      partials: null,
    };
    const data: IncomingData<any> = {
      body,
      type: EVENT_TYPES.DELETE,
    };
    instance.handleIncomingData(data);
    expect(instance.batchSet).not.toHaveBeenCalled();
  });

  it('should set if type is not delete', () => {
    const body = {
      entities: getEntityMap(3),
      partials: null,
    };
    for (let i = 0; i < 4; i += 1) {
      body.entities.set(i, {
        id: i,
        existing: 'attr',
        some: 'thing',
      });
    }
    const data: IncomingData<any> = {
      body,
      type: EVENT_TYPES.UPDATE,
    };
    instance.handleIncomingData(data);
    expect(instance.batchSet).toHaveBeenCalled();
  });
});

describe('set()', () => {
  const model = { id: 123 };
  beforeEach(() => {
    jest.spyOn(instance.data, 'set');
  });

  afterEach(() => {
    (instance.data.set as jest.Mock).mockReset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should use this.data.set', () => {
    instance.set('123', model);
    expect(instance.data.set).toHaveBeenCalledTimes(1);
    expect(instance.data.set).toHaveBeenCalledWith('123', model);
  });
});

describe('batchSet()', () => {
  beforeEach(() => {
    jest.spyOn(instance.data, 'merge');
  });

  afterEach(() => {
    (instance.data.merge as jest.Mock).mockReset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return if pass empty array', () => {
    instance.batchSet([]);
    expect(instance.data.merge).not.toHaveBeenCalled();
  });

  it('should call this.data.merge', () => {
    const data = {
      some: 'some',
      props: 'props',
      other: 'other',
      id: 1,
    };
    jest
      .spyOn(instance, 'createModel')
      .mockImplementation((entity: Entity) => entity);

    instance.batchSet(data);

    expect(instance.data.merge).toHaveBeenCalledWith({
      id: 1,
      some: 'some',
      props: 'props',
      other: 'other',
    });
    // expect(instance.data.merge).toHaveBeenCalledTimes(1);
  });
});

describe('get()', () => {
  beforeEach(() => {
    jest.spyOn(instance.data, 'get').mockReturnValue(1);
  });

  afterEach(() => {
    (instance.data.get as jest.Mock).mockClear();
    (instance.getByService as jest.Mock).mockClear();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should directly call this.data.get if init', () => {
    instance.init = true;
    jest.spyOn(instance, 'getByService').mockResolvedValue({});
    instance.get('id');
    expect(instance.getByService).not.toHaveBeenCalledTimes(1);
    expect(instance.data.get).toHaveBeenCalledTimes(1);
  });

  it('should init if this.init is not true and getByService resolve {}', () => {
    instance.init = false;
    expect(instance.init).toBe(false);
    jest.spyOn(instance, 'getByService').mockResolvedValue({});
    instance.get('id');
    expect(instance.getByService).toHaveBeenCalledTimes(1);
    expect(instance.data.get).toHaveBeenCalledTimes(1);
    expect(instance.init).toBe(true);
  });

  it('should init if this.init is not true and getByService resolve null', done => {
    instance.init = false;
    expect(instance.init).toBe(false);
    jest.spyOn(instance, 'getByService').mockResolvedValue(null);
    instance.get('id');
    setTimeout(() => {
      expect(instance.getByService).toHaveBeenCalledTimes(1);
      expect(instance.data.get).toHaveBeenCalledTimes(1);
      expect(instance.init).toBeFalsy();
      done();
    });
  });
});

describe('has()', () => {
  beforeAll(() => {
    jest.spyOn(instance.data, 'has');
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should call this.data.has', () => {
    instance.has('id');
    expect(instance.data.has).toHaveBeenCalledTimes(1);
  });
});

describe('getByService()', () => {
  const model = {};
  const service = {
    getName: jest.fn(() => model),
  };
  beforeAll(() => {
    jest.spyOn(instance, 'getService').mockImplementation(() => service);
    instance.name = 'name' as ENTITY_NAME;
  });

  afterEach(() => {
    if (jest.isMockFunction(instance.getByService)) {
      (instance.getByService as jest.Mock).mockClear();
    }
    if (jest.isMockFunction(instance.getService)) {
      (instance.getService as jest.Mock).mockClear();
    }
    if (jest.isMockFunction(service.getName)) {
      (service.getName as jest.Mock).mockClear();
    }
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should call this.service.get{name} if this.service exists', () => {
    instance.service = service as any;
    expect(instance.getByService()).toBe(model);
    expect(instance.getService).not.toHaveBeenCalled();
    expect(service.getName).toHaveBeenCalled();
  });

  it('should get service first if this.service not exists', () => {
    delete instance.service;
    expect(instance.getByService()).toBe(model);
    expect(instance.getService).toHaveBeenCalled();
    expect(service.getName).toHaveBeenCalled();
  });
});

describe('createModel()', () => {
  it('should call getModelCreator', () => {
    const result = {};
    const Model = {
      fromJS: jest.fn(() => result),
    };
    const modelProvider: ModelProvider = (ModelProvider as jest.Mock<
      ModelProvider
    >).mock.instances[0];
    jest
      .spyOn(modelProvider, 'getModelCreator')
      .mockImplementation(() => Model);

    expect(instance.createModel({})).toBe(result);
    expect(modelProvider.getModelCreator).toHaveBeenCalled();
  });
});
