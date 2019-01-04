/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 15:16:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ControllerBuilder } from '../impl/ControllerBuilder';
import { IdModel, Raw } from '../../model';

type EntityCacheTestModel = IdModel & {
  name: string;
  age: number;
};

describe('Entity Cache Manager', () => {
  const controllerBuilder = new ControllerBuilder<EntityCacheTestModel>();
  const entityCacheController = controllerBuilder.buildEntityCacheController();

  const entityA = {
    id: 1,
    name: 'cat',
    age: 1,
  };
  entityCacheController.set(entityA);

  const entityB = {
    id: 2,
    name: 'dog',
    age: 2,
  };
  entityCacheController.set(entityB);

  beforeAll(() => {
    jest.spyOn(window, 'addEventListener');
  });
  it('test for get func', async () => {
    let entity = entityCacheController.getEntity(entityA.id);
    expect(entity).toBe(entityA);

    entity = entityCacheController.getEntity(entityB.id);
    expect(entity).toBe(entityB);

    let entities = await entityCacheController.getMultiEntities([
      entityA.id,
      entityB.id,
    ]);
    expect(entities.length).toBe(2);
    expect(entities[0]).toBe(entityA);
    expect(entities[1]).toBe(entityB);

    entities = await entityCacheController.getEntities(
      (entity: EntityCacheTestModel) => {
        return entity.id === entityB.id;
      },
    );

    expect(entities.length).toBe(1);
    expect(entities[0]).toBe(entityB);
  });

  it('test for clear func', async () => {
    entityCacheController.clear();

    let entity = entityCacheController.getEntity(entityA.id);
    expect(entity).toBeUndefined();

    entity = entityCacheController.getEntity(entityB.id);
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

    await entityCacheController.replace([entityA.id], eMap);

    let entity = entityCacheController.getEntity(entityA.id);
    expect(entity).toBe(entityC);

    const entityD = {
      id: 3,
      name: 'fish',
      age: 3,
    };
    const eMap2 = new Map<number, EntityCacheTestModel>();
    eMap2.set(entityA.id, entityD);
    await entityCacheController.replace([entityA.id], eMap2);

    entity = entityCacheController.getEntity(entityA.id);
    expect(entity).toBeUndefined();
    entity = entityCacheController.getEntity(entityD.id);
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

    await entityCacheController.update(eMap);

    let entity = entityCacheController.getEntity(entityA.id);
    expect(entity).toBe(entityC);

    const entityD = {
      id: 1,
      name: 'fish two',
    };
    const eMap2 = new Map<number, Partial<Raw<EntityCacheTestModel>>>();
    eMap2.set(entityA.id, entityD);
    await entityCacheController.update(eMap, eMap2);

    entity = entityCacheController.getEntity(entityC.id);
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
    await entityCacheController.update(eMap, eMap2);

    const entity = entityCacheController.getEntity(entityC.id);
    expect(entity.name).toBe(entityD.name);
    expect(entity['__additionalKey']).toBe(entityD.__additionalKey);
    expect(entity.age).toBe(entityC.age);
  });

  it('should return not initialized when just new entityCacheManager', async () => {
    expect(entityCacheController.isInitialized()).toEqual(false);
    expect(entityCacheController.isStartInitial()).toEqual(false);
  });

  it('should return initialized after initialized entityCacheManager', async () => {
    entityCacheController.initialize([]);
    expect(entityCacheController.isInitialized()).toEqual(true);
    expect(entityCacheController.isStartInitial()).toEqual(true);
  });
});
