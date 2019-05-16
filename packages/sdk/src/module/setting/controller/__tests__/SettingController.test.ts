/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-06 14:55:49
 * Copyright © RingCentral. All rights reserved.
 */

import { SettingController } from '../SettingController';
import { SettingModuleIds } from '../../constants';
import { ServiceLoader } from '../../../serviceLoader';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('SettingController', () => {
  let settingController: SettingController;
  const moduleSetting1 = {
    buildSettingItem: () => {},
  };
  const moduleSetting2 = {
    buildSettingItem: () => {},
    dispose: () => {},
  };

  function setUp() {
    settingController = new SettingController();
    settingController['_moduleSettings'] = new Map([
      [1, moduleSetting1],
      [2, moduleSetting2],
    ]) as any;
  }

  beforeEach(() => {
    clearMocks();
  });

  describe('getModuleSettings', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return all module settings', async () => {
      moduleSetting1.buildSettingItem = jest.fn().mockResolvedValue({ id: 1 });
      moduleSetting2.buildSettingItem = jest.fn().mockResolvedValue({ id: 2 });
      const res = await settingController.getModuleSettings();
      expect(res).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('getById', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return module setting when id is module setting id', async () => {
      moduleSetting1.buildSettingItem = jest.fn().mockResolvedValue({ id: 1 });
      const res = await settingController.getById(1);
      expect(res).toEqual({ id: 1 });
    });

    it('should return service setting when id is service setting id', async () => {
      const expectRes = { id: 6 };
      ServiceLoader.getInstance = jest.fn().mockReturnValue({
        getSettingItemById: jest.fn().mockResolvedValue(expectRes),
      });
      const res = await settingController.getById(
        SettingModuleIds.RegionSetting.id,
      );
      expect(res).toEqual(expectRes);
    });
  });

  describe('getSettingsByParentId', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should combine result of sections and service settings', async () => {
      const serviceSetting = { id: 6 };
      const sectionSetting = [{ id: 1 }, { id: 2 }];
      moduleSetting1['getSections'] = jest.fn().mockReturnValue(sectionSetting);
      const service = {
        getSettingsByParentId: jest
          .fn()
          .mockResolvedValueOnce([serviceSetting]),
      };
      ServiceLoader.getInstance = jest.fn().mockReturnValue(service);

      const res = await settingController.getSettingsByParentId(1);
      expect(res).toEqual([{ id: 6 }, { id: 1 }, { id: 2 }]);
    });
  });

  describe('dispose', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should call dispose of setting module', () => {
      moduleSetting2.dispose = jest.fn();
      settingController.dispose();
      expect(moduleSetting2.dispose).toBeCalled();
    });
  });
});
