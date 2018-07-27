/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-10 10:55:24
 * Copyright © RingCentral. All rights reserved.
 */
import faker from 'faker';
import { transaction } from 'mobx';
import EntityMapStore from '../MultiEntityMapStore';
import BaseStore from '../BaseStore';
import { ENTITY_EVENT_NAME, ENTITY_CACHE_COUNT } from '../constants';
import ModelProvider from '../ModelProvider';

jest.mock('../ModelProvider');

jest.mock('mobx', () =>
  Object.assign(require.requireActual('mobx'), {
    transaction: jest.fn(),
  }),
);

jest.mock('../BaseStore');

let instance: EntityMapStore;
const getService = () => { };
const getEntity: (i?: number) => IEntity = (i?: number) => ({
  id: i || faker.random.number(10),
});
const getEntityArray: (n?: number) => IEntity[] = (n?: number) => {
  const arr: IEntity[] = [];
  for (let i = 0; i < (n || faker.random.number(10)); i++) {
    arr.push(getEntity(i));
  }
  return arr;
};
const getEntityMap: (n?: number) => Map<number, IEntity> = (n?: number) => {
  const map: Map<number, IEntity> = new Map<number, IEntity>();
  for (let i = 0; i < (n || faker.random.number(10)); i++) {
    map.set(i, getEntity(i));
  }
  return map;
};
beforeAll(() => {
  ENTITY_EVENT_NAME['name'] = ['DELETE', 'PUT', 'UPDATE'];
  ENTITY_CACHE_COUNT['name'] = 100;
  instance = new EntityMapStore('name', getService);
});

describe('EntityMapStore constructor', () => {
  it('should call super constructor', () => {
    expect(BaseStore).toHaveBeenCalledTimes(1);
  });

  it('instance should have expected properties', () => {
    expect(instance).toHaveProperty('getService', getService);
    expect(instance).toHaveProperty('maxCacheCount', 100);
  });

  it('should call subscribe on each event name', () => {
    expect(instance.subscribeNotification).toHaveBeenCalledTimes(3);
  });
});

describe('handleIncomingData()', () => {
  beforeEach(() => {
    jest.spyOn(instance, 'batchSet');
    jest.spyOn(instance, 'batchDeepSet');
  });

  afterEach(() => {
    (instance.batchSet as jest.Mock).mockReset();
    (instance.batchSet as jest.Mock).mockReset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return if entities is empty', () => {
    const data: IIncomingData = {
      type: '',
      entities: new Map(),
    };
    instance.handleIncomingData(data);

    expect(instance.batchSet).not.toHaveBeenCalled();
    expect(instance.batchDeepSet).not.toHaveBeenCalled();
  });

  const entities: Map<number, IEntity> = getEntityMap(10);

  it('should batchSet if type is put', () => {
    const data: IIncomingData = {
      type: 'put',
      entities,
    };
    instance.handleIncomingData(data);

    expect(instance.batchSet).toHaveBeenCalledTimes(1);
    expect(instance.batchDeepSet).not.toHaveBeenCalled();
  });

  it('should batchDeepSet if type is update', () => {
    const data: IIncomingData = {
      type: 'update',
      entities,
    };
    instance.handleIncomingData(data);

    expect(instance.batchSet).not.toHaveBeenCalled();
    expect(instance.batchDeepSet).toHaveBeenCalledTimes(1);
  });
});

describe('set()', () => {
  const model = { id: 123 };
  beforeEach(() => {
    jest.spyOn(instance, 'createModel').mockImplementation(() => model);
    jest.spyOn(instance.data, 'set');
  });

  afterEach(() => {
    (instance.createModel as jest.Mock).mockReset();
    (instance.data.set as jest.Mock).mockReset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should use this.data.set', () => {
    instance.set(getEntity());
    expect(instance.data.set).toHaveBeenCalledTimes(1);
    expect(instance.data.set).toHaveBeenCalledWith(123, model);
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
    const entityArr: IEntity[] = getEntityArray(2);
    jest
      .spyOn(instance, 'createModel')
      .mockImplementation((entity: IEntity) => entity);

    instance.batchSet(entityArr);

    const models = new Map();
    entityArr.forEach(({ id }: { id: number }) => {
      models.set(id, { id });
    });

    expect(instance.data.merge).toHaveBeenCalledWith(models);
    expect(instance.data.merge).toHaveBeenCalledTimes(1);
  });
});

describe('batchDeepSet()', () => {
  beforeEach(() => {
    jest.spyOn(instance.data, 'merge');
    jest.spyOn(instance, 'get').mockImplementation(() => ({
      some: 'attr',
    }));
  });

  afterEach(() => {
    (instance.data.merge as jest.Mock).mockReset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return if pass empty array', () => {
    instance.batchDeepSet([]);
    expect(instance.data.merge).not.toHaveBeenCalled();
  });

  it('should call this.data.merge with deep merged data', () => {
    const entityArr: IEntity[] = getEntityArray(2);
    jest
      .spyOn(instance, 'createModel')
      .mockImplementation((entity: IEntity) => entity);

    instance.batchDeepSet(entityArr);

    const models = new Map();
    entityArr.forEach(({ id }: { id: number }) => {
      models.set(id, { id, some: 'attr' });
    });

    expect(instance.data.merge).toHaveBeenCalledWith(models);
    expect(instance.data.merge).toHaveBeenCalledTimes(1);
    expect(instance.get).toHaveBeenCalledTimes(2);
  });
});

describe('remove()', () => {
  beforeAll(() => {
    jest.spyOn(instance.data, 'delete');
  });

  afterEach(() => {
    if (jest.isMockFunction(instance.data.delete)) {
      (instance.data.delete as jest.Mock).mockClear();
    }
    if (jest.isMockFunction(instance.get)) {
      (instance.get as jest.Mock).mockClear();
    }
  });

  function mockGetReturn(model?: { id: number; dispose?: () => {} }): void {
    jest.spyOn(instance, 'get').mockImplementation(() => model);
  }

  it('should not delete if model not exists', () => {
    mockGetReturn();
    instance.remove(1);
    expect(instance.data.delete).not.toHaveBeenCalled();
  });

  it('should call delete on data if model exists', () => {
    mockGetReturn({ id: 1 });
    instance.remove(1);
    expect(instance.data.delete).toHaveBeenCalledTimes(1);
  });

  it('should call delete on data if model exists', () => {
    const model = { id: 1, dispose: jest.fn() };
    mockGetReturn(model);
    instance.remove(1);
    expect(instance.data.delete).toHaveBeenCalledTimes(1);
    expect(model.dispose).toHaveBeenCalledTimes(1);
  });
});

describe('batchRemove()', () => {
  beforeEach(() => {
    jest.spyOn(instance, 'remove');
    (transaction as jest.Mock).mockImplementation((fn: () => void) => {
      fn();
    });
  });

  beforeEach(() => {
    (transaction as jest.Mock).mockClear();
    (instance.remove as jest.Mock).mockClear();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should call instance.remove 4 times', () => {
    instance.batchRemove([1, 2, 3, 4]);
    expect(instance.remove).toHaveBeenCalledTimes(4);
  });

  it('should use transaction', () => {
    instance.batchRemove([1, 2, 3, 4]);
    expect(transaction).toHaveBeenCalledTimes(1);
  });
});

describe('get()', () => {
  afterEach(() => {
    if (jest.isMockFunction(instance.data.get)) {
      (instance.data.get as jest.Mock).mockClear();
    }
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return model if can be retrieved with this.data.get', () => {
    const model = { id: 1 };
    jest.spyOn(instance.data, 'get').mockImplementationOnce(() => model);

    expect(instance.get(1)).toBe(model);
  });

  it('should set if can not be retrieved with this.data.get', () => {
    const model = { id: 1 };
    jest.spyOn(instance.data, 'get').mockImplementationOnce(() => null);
    jest.spyOn(instance, 'set').mockImplementation(() => {
      jest.spyOn(instance.data, 'get').mockImplementationOnce(() => model); // eslint-disable-line max-nested-callbacks
    });
    jest.spyOn(instance, 'set');
    jest
      .spyOn(instance, 'getByService')
      .mockImplementation(() => Promise.resolve(getEntity()));
    expect(instance.get(1)).toBe(model);
    expect(instance.data.get).toHaveBeenCalledTimes(2);
    expect(instance.set).toHaveBeenCalledTimes(1);
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
    instance.has(1);
    expect(instance.data.has).toHaveBeenCalledTimes(1);
  });
});

describe('first()', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return empty object if this.getSize is or less than 0', () => {
    jest.spyOn(instance, 'getSize').mockImplementation(() => 0);
    expect(instance.first()).toEqual({});
  });

  it('should return by calling this.get with the first key', () => {
    const model = {};
    jest.spyOn(instance, 'getSize').mockImplementation(() => 1);
    jest.spyOn(instance, 'get').mockImplementation(() => model);
    expect(instance.first()).toBe(model);
  });
});

describe('getByService()', () => {
  const model = {};
  const service = {
    getById: jest.fn(() => model),
  };
  beforeAll(() => {
    jest.spyOn(instance, 'getService').mockImplementation(() => service);
  });

  afterEach(() => {
    if (jest.isMockFunction(instance.getByService)) {
      (instance.getByService as jest.Mock).mockClear();
    }
    if (jest.isMockFunction(instance.getService)) {
      (instance.getService as jest.Mock).mockClear();
    }
    if (jest.isMockFunction(service.getById)) {
      (service.getById as jest.Mock).mockClear();
    }
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should call this.service.getById if this.service exists', () => {
    instance.service = service;
    expect(instance.getByService(1)).toBe(model);
    expect(instance.getService).not.toHaveBeenCalled();
    expect(service.getById).toHaveBeenCalled();
  });

  it('should get service first if this.service not exists', () => {
    delete instance.service;
    expect(instance.getByService(1)).toBe(model);
    expect(instance.getService).toHaveBeenCalled();
    expect(service.getById).toHaveBeenCalled();
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
