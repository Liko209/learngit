/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-06 14:00:04
 * Copyright © RingCentral. All rights reserved.
 */
import { RcInfoSettings } from '../RcInfoSettings';
import { SettingEntityIds } from '../../../setting';
import { ExtensionSettingHandler } from '../ExtensionSettingHandler';
import { RegionSettingHandler } from '../RegionSettingHandler';
import { CallerIdSettingHandler } from '../CallerIdSettingHandler';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('../CallerIdSettingHandler');
function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RcInfoSetting ', () => {
  function setUp() {
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        return {
          subscribeEmergencyAddressChange: jest.fn(),
          subscribeSipProvChange: jest.fn(),
        };
      });
  }

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
      expect(handlerMap[SettingEntityIds.Phone_CallerId]).toBeInstanceOf(
        CallerIdSettingHandler,
      );
      expect(handlerMap[SettingEntityIds.Phone_Extension]).toBeInstanceOf(
        ExtensionSettingHandler,
      );
      expect(handlerMap[SettingEntityIds.Phone_Region]).toBeInstanceOf(
        RegionSettingHandler,
      );
    });
  });
});
