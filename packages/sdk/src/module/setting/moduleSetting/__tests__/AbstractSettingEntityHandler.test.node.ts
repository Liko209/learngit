/*
 * @Author: Paynter Chen
 * @Date: 2019-05-26 18:57:43
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractSettingEntityHandler } from '../AbstractSettingEntityHandler';
import notificationCenter from 'sdk/service/notificationCenter';
import { ENTITY, EVENT_TYPES } from 'sdk/service';

class MockSettingEntityHandler extends AbstractSettingEntityHandler<string> {
  updateValue(value: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async fetchUserSettingEntity(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('AbstractSettingEntityHandler', () => {
  let mockSettingEntityHandler: MockSettingEntityHandler;
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
    mockSettingEntityHandler = new MockSettingEntityHandler();
  }

  function cleanUp() {
    notificationCenter.removeAllListeners();
  }

  describe('on()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should call notificationCenter on', async (done: jest.DoneCallback) => {
      mockSettingEntityHandler['userSettingEntityCache'] = {} as any;
      mockSettingEntityHandler.on('test', async payload => {
        expect(payload).toEqual('payload');
        done();
      });
      expect(notificationCenter.on).toHaveBeenCalled();
      notificationCenter.emit('test', 'payload');
    });
    it('should add to subscriptions array', () => {
      mockSettingEntityHandler['userSettingEntityCache'] = {} as any;
      mockSettingEntityHandler.on('test', async payload => {});
      expect(mockSettingEntityHandler['_subscriptions'].length).toEqual(1);
    });
    it('should callback only cache exists', async (done: jest.DoneCallback) => {
      mockSettingEntityHandler['userSettingEntityCache'] = undefined as any;
      mockSettingEntityHandler.on('test', async payload => {
        expect(1).toEqual(2);
        done();
      });
      notificationCenter.emit('test', 'payload');
      setTimeout(() => {
        expect(1).toEqual(1);
        done();
      });
    });
    it('should support filter', async (done: jest.DoneCallback) => {
      mockSettingEntityHandler['userSettingEntityCache'] = {} as any;
      mockSettingEntityHandler.on(
        'test',
        async payload => {
          expect(1).toEqual(2);
          done();
        },
        () => false,
      );
      notificationCenter.emit('test', 'payload');
      setTimeout(() => {
        expect(1).toEqual(1);
        done();
      });
    });
  });

  describe('dispose()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should off subscriptions', () => {
      mockSettingEntityHandler['userSettingEntityCache'] = {} as any;
      mockSettingEntityHandler.on('test', async payload => {});
      expect(notificationCenter.off).not.toHaveBeenCalled();
      mockSettingEntityHandler.dispose();
      expect(notificationCenter.off).toHaveBeenCalled();
    });
  });

  describe('notifyUserSettingEntityUpdate()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should call notificationCenter emitEntityUpdate(ENTITY.USER_SETTING)', () => {
      mockSettingEntityHandler['userSettingEntityCache'] = {} as any;
      mockSettingEntityHandler.notifyUserSettingEntityUpdate({} as any);
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledWith(
        ENTITY.USER_SETTING,
        [{}],
      );
    });
  });

  describe('updateUserSettingEntityCache()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should update cache', () => {
      mockSettingEntityHandler.updateUserSettingEntityCache({} as any);
      expect(mockSettingEntityHandler['userSettingEntityCache']).toEqual({});
    });
  });

  describe('getCacheValue()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should return undefined when cache not exist', () => {
      mockSettingEntityHandler['userSettingEntityCache'] = undefined;
      expect(mockSettingEntityHandler['getCacheValue']()).toBeUndefined();
      expect(
        mockSettingEntityHandler['getCacheValue']('p' as any),
      ).toBeUndefined();
    });
    it('should return value when cache exist', () => {
      const mockValue = {
        a: 'aaa',
      };
      mockSettingEntityHandler['userSettingEntityCache'] = {
        value: mockValue,
      } as any;
      expect(mockSettingEntityHandler['getCacheValue']()).toEqual(mockValue);
    });
    it('should return value property when cache exist', () => {
      const mockValue = {
        a: 'aaa',
      };
      mockSettingEntityHandler['userSettingEntityCache'] = {
        value: mockValue,
      } as any;
      expect(mockSettingEntityHandler['getCacheValue']('a' as any)).toEqual(
        mockValue.a,
      );
    });
  });

  describe('updateUserSettingEntityCache()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should update cache, once getUserSettingEntity be called', async () => {
      mockSettingEntityHandler.fetchUserSettingEntity = jest
        .fn()
        .mockResolvedValue('');
      expect(
        mockSettingEntityHandler['userSettingEntityCache'],
      ).toBeUndefined();
      const promise = mockSettingEntityHandler.getUserSettingEntity({} as any);
      expect(
        mockSettingEntityHandler['userSettingEntityCache'],
      ).not.toBeUndefined();
      await promise;
    });
    it('should update cache', () => {
      mockSettingEntityHandler.updateUserSettingEntityCache({} as any);
      expect(mockSettingEntityHandler['userSettingEntityCache']).toEqual({});
    });
    it('should get from cache when enabled cache', async () => {
      mockSettingEntityHandler['userSettingEntityCache'] = 'test' as any;
      mockSettingEntityHandler.fetchUserSettingEntity = jest.fn();
      expect(await mockSettingEntityHandler.getUserSettingEntity(true)).toEqual(
        'test',
      );
    });
    it('should get from cache when disabled cache', async () => {
      mockSettingEntityHandler['userSettingEntityCache'] = 'test' as any;
      mockSettingEntityHandler.fetchUserSettingEntity = jest
        .fn()
        .mockResolvedValue('from fetch');
      expect(
        await mockSettingEntityHandler.getUserSettingEntity(false),
      ).toEqual('from fetch');
      expect(
        mockSettingEntityHandler.fetchUserSettingEntity,
      ).toHaveBeenCalled();
    });
    it('should fetchUserSettingEntity when cache not available', async () => {
      mockSettingEntityHandler['userSettingEntityCache'] = undefined;
      mockSettingEntityHandler.fetchUserSettingEntity = jest
        .fn()
        .mockResolvedValue('from fetch');
      expect(await mockSettingEntityHandler.getUserSettingEntity(true)).toEqual(
        'from fetch',
      );
      expect(
        mockSettingEntityHandler.fetchUserSettingEntity,
      ).toHaveBeenCalled();
    });
  });

  describe('onEntity()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should return object contain onUpdate, onDelete method', () => {
      mockSettingEntityHandler['userSettingEntityCache'] = {} as any;
      const result = mockSettingEntityHandler.onEntity();
      expect(result.onUpdate).not.toBeUndefined();
      expect(result.onDelete).not.toBeUndefined();
    });
    it('should onUpdate callback when payload.type === EVENT_TYPES.UPDATE', (done: jest.DoneCallback) => {
      const mockEntities = [{ id: 1 }];
      mockSettingEntityHandler['userSettingEntityCache'] = {} as any;
      mockSettingEntityHandler.onEntity().onUpdate('test', async payload => {
        expect(payload.type).toEqual(EVENT_TYPES.UPDATE);
        done();
      });
      notificationCenter.emitEntityUpdate('test', mockEntities);
    });
    it('should not onUpdate callback when payload.type !== EVENT_TYPES.UPDATE', (done: jest.DoneCallback) => {
      mockSettingEntityHandler['userSettingEntityCache'] = {} as any;
      mockSettingEntityHandler.onEntity().onUpdate('test', async () => {
        expect(1).toEqual(2);
        done();
      });

      setTimeout(() => {
        expect(1).toEqual(1);
        done();
      });
      notificationCenter.emit('test', []);
    });
    it('should onDelete callback when payload.type === EVENT_TYPES.DELETE', (done: jest.DoneCallback) => {
      const mockEntities = [1, 2, 3];
      mockSettingEntityHandler['userSettingEntityCache'] = {} as any;
      mockSettingEntityHandler.onEntity().onDelete('test', async payload => {
        expect(payload.type).toEqual(EVENT_TYPES.DELETE);
        done();
      });
      notificationCenter.emitEntityDelete('test', mockEntities);
    });
    it('should not onDelete callback when payload.type !== EVENT_TYPES.DELETE', (done: jest.DoneCallback) => {
      mockSettingEntityHandler['userSettingEntityCache'] = {} as any;
      mockSettingEntityHandler.onEntity().onUpdate('test', async () => {
        expect(1).toEqual(2);
        done();
      });

      setTimeout(() => {
        expect(1).toEqual(1);
        done();
      });
      notificationCenter.emit('test', []);
    });
  });
});
