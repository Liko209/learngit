/*
 * @Author: Paynter Chen
 * @Date: 2019-05-28 17:45:42
 * Copyright © RingCentral. All rights reserved.
 */

import { SettingService } from '../SettingService';
import { SettingController } from '../../controller/SettingController';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('SearchService', () => {
  let settingController: SettingController;
  let settingService: SettingService;
  function setUp() {
    settingController = {
      init: jest.fn(),
      dispose: jest.fn(),
      registerModuleSetting: jest.fn(),
      unRegisterModuleSetting: jest.fn(),
    } as any;
    settingService = new SettingService();
    settingService['_settingController'] = settingController;
  }

  describe('registerModuleSetting()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      clearMocks();
    });
    it('should proxy settingController.registerModuleSetting', () => {
      settingService.registerModuleSetting({} as any);
      expect(settingController.registerModuleSetting).toBeCalledWith({});
    });
  });
  describe('onStarted', () => {
    it('should call init when setting controller is not null', () => {
      settingService.onStarted();
      expect(settingController.init).toBeCalled();
    });
  });
  describe('onStopped', () => {
    it('should call init when setting controller is not null', () => {
      settingService.onStopped();
      expect(settingController.dispose).toBeCalled();
    });
  });

  describe('registerModuleSetting()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      clearMocks();
    });
    it('should proxy settingController.unRegisterModuleSetting', () => {
      settingService.unRegisterModuleSetting({} as any);
      expect(settingController.unRegisterModuleSetting).toBeCalledWith({});
    });
  });
});
