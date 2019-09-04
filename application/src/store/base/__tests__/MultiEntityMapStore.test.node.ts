/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-10 10:55:24
 * Copyright © RingCentral. All rights reserved.
 */
import faker from 'faker';
import { service } from 'sdk';
import MultiEntityMapStore from '../MultiEntityMapStore';
import { ENTITY_SETTING } from '../../config';
import { ENTITY_NAME } from '../../constants';
import { Entity } from '@/store';
import { BaseModel } from 'sdk/models';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import { PostService } from 'sdk/module/post';
import { ServiceLoader } from 'sdk/module/serviceLoader';

const { EVENT_TYPES } = service;
jest.mock('../visibilityChangeEvent');
jest.mock('sdk/module/post');

const getEntity: (i?: number) => Entity = (i?: number) => ({
  id: i || faker.random.number(10),
});
const getEntityArray: (n?: number) => Entity[] = (n?: number) => {
  const arr: Entity[] = [];
  for (let i = 1; i <= (n || faker.random.number(10)); i += 1) {
    arr.push(getEntity(i));
  }
  return arr;
};
const getEntityMap: (n?: number) => Map<number, Entity> = (n?: number) => {
  const map: Map<number, Entity> = new Map<number, Entity>();
  for (let i = 1; i <= (n || faker.random.number(10)); i += 1) {
    map.set(i, getEntity(i));
  }
  return map;
};

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('MultiEntityMapStore', () => {
  let instance: MultiEntityMapStore<any, any>;
  let postService: PostService;
  function setUp() {
    postService = new PostService();
    ServiceLoader.getInstance = jest.fn().mockReturnValue(postService);

    instance = new MultiEntityMapStore(
      ENTITY_NAME.POST,
      ENTITY_SETTING[ENTITY_NAME.POST],
    );
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('handleIncomingData()', () => {
    const entityMap = getEntityMap(10);
    const body = {
      ids: Array.from(entityMap.keys()),
      entities: entityMap,
    };
    const entitiesArray = getEntityArray(5);
    beforeEach(() => {
      instance.batchSet(entitiesArray);
    });

    afterEach(() => {
      instance.clearAll();
    });

    it('for put type', () => {
      const data: NotificationEntityPayload<BaseModel> = {
        body,
        type: EVENT_TYPES.UPDATE,
      };
      instance.handleIncomingData(data);

      const models = instance.getData();

      expect(models.size).toBe(5);
    });

    it('for update type', () => {
      const data: NotificationEntityPayload<BaseModel> = {
        body,
        type: EVENT_TYPES.UPDATE,
      };
      instance.handleIncomingData(data);

      const models = instance.getData();

      expect(models.size).toBe(5);
    });

    it('for delete type', async (done: any) => {
      const data: NotificationEntityPayload<BaseModel> = {
        body: { ids: [1, 2, 3, 4, 5, 6] },
        type: EVENT_TYPES.DELETE,
      };
      instance.handleIncomingData(data);
      const models = instance.getData();
      setTimeout(() => {
        expect(models.size).toBe(0);
        done();
      }, 0);
    });
  });

  describe('get()', () => {
    it('get', () => {
      postService.getById.mockResolvedValueOnce({ id: '1' });
      instance.get(1);
      const models = instance.getData();
      expect(models.size).toBe(1);
      expect(models.has('1')).toBeTruthy();
    });
  });

  describe('subtractedBy()', () => {
    it('should return differences and interactions', () => {
      getEntityMap(10);
      const result = instance.subtractedBy([10, 11]);
      expect(result).toEqual([[10, 11], []]);
    });
  });

  describe('hasValid()', () => {
    it('should return false when model not found', () => {
      expect(instance.hasValid(9999)).toBe(false);
    });

    it('should return false when model is mocked', () => {
      instance.set({
        id: 9999,
        isMocked: true,
      });
      expect(instance.hasValid(9999)).toBe(false);
    });

    it('should return true when model is mocked and did partial update', () => {
      instance.set({
        id: 9999,
        isMocked: true,
      });
      const map = new Map();
      map.set(9999, {
        created_at: 123,
      });
      instance.batchUpdate(map);
      expect(instance.hasValid(9999)).toBe(true);
    });
  });

  describe('refresh Cache', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    function setHidden(hid: any) {
      Object.defineProperty(global, 'document', {
        get: jest.fn().mockReturnValue({
          hidden: hid,
        }),
      });
    }
    const setting = ENTITY_SETTING[ENTITY_NAME.POST];
    it('should not clear cache when size has not reach the limit', (done: any) => {
      setHidden(false);
      setting.cacheCount = 2;
      instance = new MultiEntityMapStore(ENTITY_NAME.POST, setting);

      instance.batchSet([{ id: 1 }]);
      expect(Array.from(instance.getData().keys())).toEqual(['1']);

      setTimeout(() => {
        expect(Array.from(instance.getData().keys())).toEqual(['1']);
        done();
      }, 120);
    });

    it('should not clear cache when document is not hidden', async (done: any) => {
      setHidden(false);
      setting.cacheCount = 1;
      instance = new MultiEntityMapStore(ENTITY_NAME.POST, setting);

      instance.batchSet([{ id: 1 }, { id: 2 }]);
      expect(Array.from(instance.getData().keys())).toEqual(['1', '2']);

      setTimeout(() => {
        expect(Array.from(instance.getData().keys())).toEqual(['1', '2']);
        done();
      }, 120);
    });

    it('should refresh cache when cache is oversized and app is hidden', async (done: any) => {
      setHidden(true);
      setting.cacheCount = 1;
      instance = new MultiEntityMapStore(ENTITY_NAME.POST, setting);
      instance.batchSet([{ id: 1 }, { id: 2 }]);
      expect(Array.from(instance.getData().keys())).toEqual(['1', '2']);
      setTimeout(() => {
        expect(Array.from(instance.getData().keys())).toEqual([]);
        done();
      }, 120);
    });

    it('should not refresh cache when refreshCache is false in batchSet ', async (done: any) => {
      setHidden(false);
      setting.cacheCount = 1;
      instance = new MultiEntityMapStore(ENTITY_NAME.POST, setting);
      instance.batchSet([{ id: 1 }, { id: 2 }]);
      expect(Array.from(instance.getData().keys())).toEqual(['1', '2']);
      setTimeout(() => {
        expect(Array.from(instance.getData().keys())).toEqual(['1', '2']);
        done();
      }, 120);
    });
  });

  describe('find', () => {
    beforeEach(() => {
      instance.batchSet([
        { id: 1, text: 'a' },
        { id: 2, text: 'b' },
        { id: 3, text: 'c' },
      ], false);
    });

    afterEach(() => {
      instance.clearAll();
    });
    it('should find the entity by condition', () => {
      const result = instance.find(({text}) => text === 'a');
      expect(result.id).toBe(1);
    })

    it('should not find the entity by condition', () => {
      const result = instance.find(({text}) => text === 'd');
      expect(result).toBe(null);
    })
  });
});
