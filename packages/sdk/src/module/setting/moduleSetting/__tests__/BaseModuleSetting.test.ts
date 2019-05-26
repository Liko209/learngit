/*
 * @Author: Paynter Chen
 * @Date: 2019-05-26 18:57:43
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseModuleSetting } from '../BaseModuleSetting';
import { IUserSettingHandler } from '../types';

type HandlerMap = { [id: number]: IUserSettingHandler };

class MockModuleSetting extends BaseModuleSetting<HandlerMap> {
  constructor(public handlerMap: HandlerMap) {
    super();
  }

  protected getHandlerMap(): HandlerMap {
    return this.handlerMap;
  }
}

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('BaseModuleSetting', () => {
  const createSettingHandler = (): IUserSettingHandler => {
    return ({
      getUserSettingEntity: jest.fn(),
      dispose: jest.fn(),
    } as any) as IUserSettingHandler;
  };

  function setUp() {}

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('init()', () => {
    it('should init _handlerMap', () => {
      const mockHandlerMap = {
        1: createSettingHandler(),
        123: createSettingHandler(),
      };
      const mockModuleSetting = new MockModuleSetting(mockHandlerMap);
      mockModuleSetting.init();
      expect(mockModuleSetting['_handlerMap']).toEqual(mockHandlerMap);
    });
  });
  describe('dispose()', () => {
    it('should dispose all SettingEntityHandler', () => {
      const mockHandlerMap = {
        1: createSettingHandler(),
        123: createSettingHandler(),
      };
      const mockModuleSetting = new MockModuleSetting(mockHandlerMap);
      mockModuleSetting.init();
      mockModuleSetting.dispose();
      expect(mockHandlerMap[1].dispose).toBeCalled();
      expect(mockHandlerMap[123].dispose).toBeCalled();
    });
    it('should dispose all SettingEntityHandler', () => {
      const mockHandlerMap = {};
      const mockModuleSetting = new MockModuleSetting(mockHandlerMap);
      mockModuleSetting.init();
      try {
        mockModuleSetting.dispose();
      } catch {
        expect(1).toEqual(2);
      }
      expect(1).toEqual(1);
    });
  });
  describe('getById()', () => {
    it('should get from _handlerMap', async () => {
      const mockHandlerMap = {
        1: createSettingHandler(),
        123: createSettingHandler(),
      };
      ((mockHandlerMap[1][
        'getUserSettingEntity'
      ] as any) as jest.Mock).mockResolvedValue(1);
      ((mockHandlerMap[123][
        'getUserSettingEntity'
      ] as any) as jest.Mock).mockResolvedValue(123);
      const mockModuleSetting = new MockModuleSetting(mockHandlerMap);
      mockModuleSetting.init();
      expect(await mockModuleSetting.getById(1)).toEqual(1);
      expect(await mockModuleSetting.getById(123)).toEqual(123);
    });
    it('should get return null if not exist in handlerMap', async () => {
      const mockHandlerMap = {
        1: createSettingHandler(),
        123: createSettingHandler(),
      };
      ((mockHandlerMap[1][
        'getUserSettingEntity'
      ] as any) as jest.Mock).mockResolvedValue(1);
      ((mockHandlerMap[123][
        'getUserSettingEntity'
      ] as any) as jest.Mock).mockResolvedValue(123);
      const mockModuleSetting = new MockModuleSetting(mockHandlerMap);
      mockModuleSetting.init();
      expect(await mockModuleSetting.getById(2)).toEqual(null);
    });
  });
});
