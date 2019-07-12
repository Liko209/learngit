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
      expect(settingController.registerModuleSetting).toHaveBeenCalledWith({});
    });
  });

  describe('getById()', () => {
    it('should return expect value when internal is undefined', async () => {
      settingController.getById = jest.fn().mockReturnValue(1);
      const result = await settingService.getById(1);
      expect(result).toEqual(1);
    });
    it('should return expect value when internal is undefined and getById has resolve', async () => {
      settingController.getById = jest.fn().mockReturnValue(1);
      Promise.race = jest.fn().mockReturnValue(0);
      const result = await settingService.getById(1, 0);
      expect(result).toEqual(0);
      expect(Promise.race).toHaveBeenCalled();
    });
  });
  describe('onStarted', () => {
    it('should call init when setting controller is not null', () => {
      settingService.onStarted();
      expect(settingController.init).toHaveBeenCalled();
    });
  });
  describe('onStopped', () => {
    it('should call init when setting controller is not null', () => {
      settingService.onStopped();
      expect(settingController.dispose).toHaveBeenCalled();
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
      expect(settingController.unRegisterModuleSetting).toHaveBeenCalledWith(
        {},
      );
    });
  });
});
