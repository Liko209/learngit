/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-06 14:55:49
 * Copyright © RingCentral. All rights reserved.
 */

import { SettingController } from '../SettingController';
import { IModuleSetting } from '../../moduleSetting';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('SettingController', () => {
  let settingController: SettingController;
  const createMockModuleSetting = (mockSettingEntity: any = {}) => {
    return {
      getById: jest.fn().mockResolvedValue(mockSettingEntity),
      init: jest.fn(),
      dispose: jest.fn(),
    } as IModuleSetting;
  };

  function setUp() {
    settingController = new SettingController();
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('registerModuleSetting()', () => {
    it('should register to _moduleSettings', () => {
      const mockModuleSetting = createMockModuleSetting();
      settingController.registerModuleSetting(mockModuleSetting);
      expect(settingController['_moduleSettings']).toHaveLength(1);
    });
    it('should init ModuleSetting when register', () => {
      const mockModuleSetting = createMockModuleSetting();
      settingController.registerModuleSetting(mockModuleSetting);
      expect(mockModuleSetting.init).toBeCalled();
    });
  });
  describe('unRegisterModuleSetting()', () => {
    it('should unRegister from _moduleSettings', () => {
      const mockModuleSetting = createMockModuleSetting();
      settingController.registerModuleSetting(mockModuleSetting);
      expect(settingController['_moduleSettings']).toHaveLength(1);
      settingController.unRegisterModuleSetting(mockModuleSetting);
      expect(settingController['_moduleSettings']).toHaveLength(0);
    });
    it('should dispose ModuleSetting when unregister', () => {
      const mockModuleSetting = createMockModuleSetting();
      settingController.registerModuleSetting(mockModuleSetting);
      expect(settingController['_moduleSettings']).toHaveLength(1);
      settingController.unRegisterModuleSetting(mockModuleSetting);
      expect(settingController['_moduleSettings']).toHaveLength(0);
      expect(mockModuleSetting.dispose).toBeCalled();
    });
  });
  describe('getById()', () => {
    it('should get result from register modules', async () => {
      const mockModuleSetting1 = createMockModuleSetting();
      settingController.registerModuleSetting(mockModuleSetting1);
      const mockModuleSetting2 = createMockModuleSetting();
      settingController.registerModuleSetting(mockModuleSetting2);
      mockModuleSetting1.getById.mockResolvedValue(null);
      mockModuleSetting2.getById.mockResolvedValue('result');
      expect(await settingController.getById(1)).toEqual(
        await mockModuleSetting2.getById(1),
      );
    });
  });
  describe('init()', () => {
    it('should init all exist ModuleSettings', () => {
      const mockModuleSetting1 = createMockModuleSetting();
      const mockModuleSetting2 = createMockModuleSetting();
      settingController['_moduleSettings'] = [
        mockModuleSetting1,
        mockModuleSetting2,
      ];
      settingController.init();
      expect(mockModuleSetting1.init).toBeCalled();
      expect(mockModuleSetting2.init).toBeCalled();
    });
  });
  describe('dispose()', () => {
    it('should dispose all ModuleSetting', (done: jest.DoneCallback) => {
      const mockModuleSetting1 = createMockModuleSetting();
      settingController.registerModuleSetting(mockModuleSetting1);
      const mockModuleSetting2 = createMockModuleSetting();
      settingController.registerModuleSetting(mockModuleSetting2);
      settingController.dispose();
      setTimeout(() => {
        expect(mockModuleSetting1.dispose).toBeCalled();
        expect(mockModuleSetting2.dispose).toBeCalled();
        done();
      });
    });
  });
});
