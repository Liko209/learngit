/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-06 14:00:04
 * Copyright © RingCentral. All rights reserved.
 */
import { RcInfoSettings } from '../RcInfoSettings';
import { SettingEntityIds } from '../../../setting';
import { ExtensionSettingHandler } from '../ExtensionSettingHandler';
import { RegionSettingHandler } from '../RegionSettingHandler';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RcInfoSetting ', () => {
  function setUp() {}

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('handlerMap', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return handlerMap correctly', async () => {
      const moduleSetting = new RcInfoSettings({} as any);
      const handlerMap = moduleSetting.getHandlerMap();
      expect(handlerMap[SettingEntityIds.Phone_Extension]).toBeInstanceOf(
        ExtensionSettingHandler,
      );
      expect(handlerMap[SettingEntityIds.Phone_Region]).toBeInstanceOf(
        RegionSettingHandler,
      );
    });
  });
});
