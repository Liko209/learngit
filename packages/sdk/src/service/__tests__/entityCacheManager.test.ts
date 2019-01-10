import EntityCacheManager from '../entityCacheManager';
import { IdModel, Raw } from '../../framework/model';

type EntityCacheTestModel = IdModel & {
  name: string;
  age: number;
};

describe('Entity Cache Manager', () => {
  const manager = new EntityCacheManager<EntityCacheTestModel>();
  const entityA = {
    id: 1,
    name: 'cat',
    age: 1,
  };
  manager.set(entityA);

  const entityB = {
    id: 2,
    name: 'dog',
    age: 2,
  };
  manager.set(entityB);

  beforeAll(() => {
    jest.mock('../notificationCenter');
    jest.spyOn(window, 'addEventListener');
  });
  it('test for get func', async () => {
    let entity = manager.getEntity(entityA.id);
    expect(entity).toBe(entityA);

    entity = manager.getEntity(entityB.id);
    expect(entity).toBe(entityB);

    let entities = await manager.getMultiEntities([entityA.id, entityB.id]);
    expect(entities.length).toBe(2);
    expect(entities[0]).toBe(entityA);
    expect(entities[1]).toBe(entityB);

    entities = await manager.getEntities((entity: EntityCacheTestModel) => {
      return entity.id === entityB.id;
    });

    expect(entities.length).toBe(1);
    expect(entities[0]).toBe(entityB);
  });

  it('test for clear func', async () => {
    manager.clear();

    let entity = manager.getEntity(entityA.id);
    expect(entity).toBeUndefined();

    entity = manager.getEntity(entityB.id);
    expect(entity).toBeUndefined();
  });

  it('test for replace func', async () => {
    const entityC = {
      id: 1,
      name: 'fish',
      age: 3,
    };

    const eMap = new Map<number, EntityCacheTestModel>();
    eMap.set(entityC.id, entityC);

    await manager.replace([entityA.id], eMap);

    let entity = manager.getEntity(entityA.id);
    expect(entity).toBe(entityC);

    const entityD = {
      id: 3,
      name: 'fish',
      age: 3,
    };
    const eMap2 = new Map<number, EntityCacheTestModel>();
    eMap2.set(entityA.id, entityD);
    await manager.replace([entityA.id], eMap2);

    entity = manager.getEntity(entityA.id);
    expect(entity).toBeUndefined();
    entity = manager.getEntity(entityD.id);
    expect(entity).toBe(entity);
  });

  it('test for update func', async () => {
    const entityC = {
      id: 1,
      name: 'fish',
      age: 3,
    };

    const eMap = new Map<number, EntityCacheTestModel>();
    eMap.set(entityC.id, entityC);

    await manager.update(eMap);

    let entity = manager.getEntity(entityA.id);
    expect(entity).toBe(entityC);

    const entityD = {
      id: 1,
      name: 'fish two',
    };
    const eMap2 = new Map<number, Partial<Raw<EntityCacheTestModel>>>();
    eMap2.set(entityA.id, entityD);
    await manager.update(eMap, eMap2);

    entity = manager.getEntity(entityC.id);
    expect(entity.name).toBe(entityD.name);
    expect(entity.age).toBe(entityC.age);
  });

  it('should not change key when update', async () => {
    const entityC = {
      id: 1,
      name: 'fish',
      age: 3,
    };

    const eMap = new Map<number, EntityCacheTestModel>();
    eMap.set(entityC.id, entityC);

    const entityD = {
      id: 1,
      name: 'fish two',
      __additionalKey: 'additionalKey',
    };
    const eMap2 = new Map<number, Partial<Raw<EntityCacheTestModel>>>();
    eMap2.set(entityA.id, entityD);
    await manager.update(eMap, eMap2);

    const entity = manager.getEntity(entityC.id);
    expect(entity.name).toBe(entityD.name);
    expect(entity['__additionalKey']).toBe(entityD.__additionalKey);
    expect(entity.age).toBe(entityC.age);
  });

  it('should return not initialized when just new entityCacheManager', async () => {
    expect(manager.isInitialized()).toEqual(false);
    expect(manager.isStartInitial()).toEqual(false);
  });

  it('should return initialized after initialized entityCacheManager', async () => {
    manager.initialize([]);
    expect(manager.isInitialized()).toEqual(true);
    expect(manager.isStartInitial()).toEqual(true);
  });
});
