/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 15:16:00
 * Copyright © RingCentral. All rights reserved.
 */

import { buildEntityCacheController } from '../';
import { IdModel } from '../../model';
import { IEntityCacheController } from '../interface/IEntityCacheController';

type EntityCacheTestModel = IdModel & {
  name: string;
  age: number;
};

describe('Entity Cache Manager', () => {
  let entityCacheController: IEntityCacheController<EntityCacheTestModel>;

  const entityA = {
    id: 1,
    name: 'cat',
    age: 1,
  };

  const entityB = {
    id: 2,
    name: 'dog',
    age: 2,
  };

  beforeAll(async () => {
    entityCacheController = buildEntityCacheController();
    await entityCacheController.put(entityA);
    await entityCacheController.put(entityB);
  });
  it('test for get func', async () => {
    let entity = await entityCacheController.get(entityA.id);
    expect(entity).toBe(entityA);

    entity = await entityCacheController.get(entityB.id);
    expect(entity).toBe(entityB);

    let entities = await entityCacheController.batchGet([
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

    let entity = await entityCacheController.get(entityA.id);
    expect(entity).toBeUndefined();

    entity = await entityCacheController.get(entityB.id);
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

    let entity = await entityCacheController.get(entityA.id);
    expect(entity).toBe(entityC);

    const entityD = {
      id: 3,
      name: 'fish',
      age: 3,
    };
    const eMap2 = new Map<number, EntityCacheTestModel>();
    eMap2.set(entityA.id, entityD);
    await entityCacheController.replace([entityA.id], eMap2);

    entity = await entityCacheController.get(entityA.id);
    expect(entity).toBeUndefined();
    entity = await entityCacheController.get(entityD.id);
    expect(entity).toBe(entity);
  });

  it('test for update func', async () => {
    const entityC = {
      id: 1,
      name: 'fish',
      age: 3,
    };

    await entityCacheController.update(entityC);
    let entity = await entityCacheController.get(entityA.id);
    expect(entity).toBe(entityC);

    const entityD = {
      id: 1,
      name: 'fish two',
    };
    await entityCacheController.update(entityD);
    entity = await entityCacheController.get(entityC.id);
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
    await entityCacheController.update(entityD);

    const entity = await entityCacheController.get(entityC.id);
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
