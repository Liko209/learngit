/*
 * @Author: Paynter Chen
 * @Date: 2019-05-26 18:57:43
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractUserSettingHandler } from '../AbstractSettingEntityHandler';
import notificationCenter from 'sdk/service/notificationCenter';
import { ENTITY, EVENT_TYPES } from 'sdk/service';

class MockSettingEntityHandler extends AbstractUserSettingHandler<string> {
  getUserSettingEntity(disableCache?: boolean): Promise<any> {
    throw new Error('Method not implemented.');
  }

  updateValue(value: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('AbstractSettingEntityHandler', () => {
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('on()', () => {
    it('should call notificationCenter on', async (done: jest.DoneCallback) => {
      const mockSettingEntityHandler = new MockSettingEntityHandler();
      mockSettingEntityHandler['userSettingEntityCache'] = {} as any;
      mockSettingEntityHandler.on('test', async payload => {
        expect(payload).toEqual('payload');
        mockSettingEntityHandler.dispose();
        done();
      });
      expect(notificationCenter.on).toBeCalled();
      notificationCenter.emit('test', 'payload');
    });
    it('should add to subscriptions array', () => {
      const mockSettingEntityHandler = new MockSettingEntityHandler();
      mockSettingEntityHandler['userSettingEntityCache'] = {} as any;
      mockSettingEntityHandler.on('test', async payload => {});
      expect(mockSettingEntityHandler['_subscriptions'].length).toEqual(1);
      mockSettingEntityHandler.dispose();
    });
    it('should callback only cache exists', async (done: jest.DoneCallback) => {
      const mockSettingEntityHandler = new MockSettingEntityHandler();
      mockSettingEntityHandler['userSettingEntityCache'] = undefined as any;
      mockSettingEntityHandler.on('test', async payload => {
        expect(1).toEqual(2);
        done();
      });
      notificationCenter.emit('test', 'payload');
      setTimeout(() => {
        expect(1).toEqual(1);
        mockSettingEntityHandler.dispose();
        done();
      });
    });
    it('should support filter', async (done: jest.DoneCallback) => {
      const mockSettingEntityHandler = new MockSettingEntityHandler();
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
        mockSettingEntityHandler.dispose();
        done();
      });
    });
  });

  describe('dispose()', () => {
    it('should off subscriptions', () => {
      const mockSettingEntityHandler = new MockSettingEntityHandler();
      mockSettingEntityHandler['userSettingEntityCache'] = {} as any;
      mockSettingEntityHandler.on('test', async payload => {});
      expect(notificationCenter.off).not.toBeCalled();
      mockSettingEntityHandler.dispose();
      expect(notificationCenter.off).toBeCalled();
    });
  });

  describe('notifyUserSettingEntityUpdate()', () => {
    it('should call notificationCenter emitEntityUpdate(ENTITY.USER_SETTING)', () => {
      const mockSettingEntityHandler = new MockSettingEntityHandler();
      mockSettingEntityHandler['userSettingEntityCache'] = {} as any;
      mockSettingEntityHandler.notifyUserSettingEntityUpdate({} as any);
      expect(notificationCenter.emitEntityUpdate).toBeCalledWith(
        ENTITY.USER_SETTING,
        [{}],
      );
    });
  });
  describe('updateUserSettingEntityCache()', () => {
    it('should update cache', () => {
      const mockSettingEntityHandler = new MockSettingEntityHandler();
      mockSettingEntityHandler.updateUserSettingEntityCache({} as any);
      expect(mockSettingEntityHandler['userSettingEntityCache']).toEqual({});
    });
  });
  describe('onEntity()', () => {
    it('should return object contain onUpdate, onDelete method', () => {
      const mockSettingEntityHandler = new MockSettingEntityHandler();
      mockSettingEntityHandler['userSettingEntityCache'] = {} as any;
      const result = mockSettingEntityHandler.onEntity();
      expect(result.onUpdate).not.toBeUndefined();
      expect(result.onDelete).not.toBeUndefined();
    });
    it('should onUpdate callback when payload.type === EVENT_TYPES.UPDATE', (done: jest.DoneCallback) => {
      const mockSettingEntityHandler = new MockSettingEntityHandler();
      const mockEntities = [{ id: 1 }];
      mockSettingEntityHandler['userSettingEntityCache'] = {} as any;
      mockSettingEntityHandler.onEntity().onUpdate('test', async payload => {
        expect(payload.type).toEqual(EVENT_TYPES.UPDATE);
        mockSettingEntityHandler.dispose();
        done();
      });
      notificationCenter.emitEntityUpdate('test', mockEntities);
    });
    it('should not onUpdate callback when payload.type !== EVENT_TYPES.UPDATE', (done: jest.DoneCallback) => {
      const mockSettingEntityHandler = new MockSettingEntityHandler();
      mockSettingEntityHandler['userSettingEntityCache'] = {} as any;
      mockSettingEntityHandler.onEntity().onUpdate('test', async () => {
        expect(1).toEqual(2);
        done();
      });

      setTimeout(() => {
        expect(1).toEqual(1);
        mockSettingEntityHandler.dispose();
        done();
      });
      notificationCenter.emit('test', []);
    });
    it('should onDelete callback when payload.type === EVENT_TYPES.DELETE', (done: jest.DoneCallback) => {
      const mockSettingEntityHandler = new MockSettingEntityHandler();
      const mockEntities = [1, 2, 3];
      mockSettingEntityHandler['userSettingEntityCache'] = {} as any;
      mockSettingEntityHandler.onEntity().onDelete('test', async payload => {
        expect(payload.type).toEqual(EVENT_TYPES.DELETE);
        mockSettingEntityHandler.dispose();
        done();
      });
      notificationCenter.emitEntityDelete('test', mockEntities);
    });
    it('should not onDelete callback when payload.type !== EVENT_TYPES.DELETE', (done: jest.DoneCallback) => {
      const mockSettingEntityHandler = new MockSettingEntityHandler();
      mockSettingEntityHandler['userSettingEntityCache'] = {} as any;
      mockSettingEntityHandler.onEntity().onUpdate('test', async () => {
        expect(1).toEqual(2);
        done();
      });

      setTimeout(() => {
        expect(1).toEqual(1);
        mockSettingEntityHandler.dispose();
        done();
      });
      notificationCenter.emit('test', []);
    });
  });
});
