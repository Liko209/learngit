/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-06 14:00:04
 * Copyright © RingCentral. All rights reserved.
 */
import { ESettingItemState } from 'sdk/framework/model/setting';
import notificationCenter from '../../../../service/notificationCenter';
import { RcInfoSettings } from '../RcInfoSettings';
import { IRCInfoService } from '../../service/IRCInfoService';
import { SettingModuleIds } from '../../../setting/constants';
import { ESettingValueType } from '../../../setting';
import { ERCWebSettingUri } from '../../types';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RcInfoSettings', () => {
  let rcInfoService: IRCInfoService;
  let rcInfoSettings: RcInfoSettings;

  function setUp() {
    rcInfoService = {
      generateWebSettingUri: (type: any) => {},
      getCurrentCountry: () => {},
      getAreaCode: () => {},
      getCountryList: () => {},
      hasAreaCode: () => {},
    } as any;

    rcInfoSettings = new RcInfoSettings(rcInfoService);
  }
  beforeEach(() => {
    clearMocks();
  });

  describe('constructor', () => {
    beforeEach(() => {
      clearMocks();
    });
    it('should subscribe notification when create self', () => {
      notificationCenter.on = jest.fn();
      rcInfoSettings = new RcInfoSettings(rcInfoService);

      expect(notificationCenter.on).toHaveBeenCalledWith(
        'RC_INFO.CLIENT_INFO',
        expect.any(Function),
      );

      expect(notificationCenter.on).toHaveBeenCalledWith(
        'RC_INFO.RC_REGION_INFO',
        expect.any(Function),
      );
    });
  });

  describe('getSettingById', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return region setting entity with disabled state when has no dialing plan country ', async () => {
      rcInfoService.getAreaCode = jest.fn().mockResolvedValue('650');
      rcInfoService.getCurrentCountry = jest
        .fn()
        .mockResolvedValue({ id: 1, callingCode: 'us' });
      rcInfoService.getCountryList = jest.fn().mockReturnValue([]);
      const res = await rcInfoSettings.getSettingById(
        SettingModuleIds.RegionSetting.id,
      );
      expect(res).toEqual({
        id: SettingModuleIds.RegionSetting.id,
        parentModelId: SettingModuleIds.PhoneSetting_General.id,
        value: {
          areaCode: '650',
          countryInfo: { id: 1, callingCode: 'us' },
        },
        valueType: ESettingValueType.OBJECT,
        weight: SettingModuleIds.RegionSetting.weight,
        state: 1,
      });
    });

    it('should return extension entity', async () => {
      rcInfoService.generateWebSettingUri = jest
        .fn()
        .mockResolvedValue('glip.com');
      const res = await rcInfoSettings.getSettingById(
        SettingModuleIds.ExtensionSetting.id,
      );
      expect(res).toEqual({
        id: SettingModuleIds.ExtensionSetting.id,
        parentModelId: SettingModuleIds.PhoneSetting_General.id,
        valueGetter: expect.anything(),
        valueType: ESettingValueType.LINK,
        weight: SettingModuleIds.ExtensionSetting.weight,
        state: 0,
      });
      expect(res.valueGetter()).resolves.toEqual('glip.com');
      expect(rcInfoService.generateWebSettingUri).toBeCalledWith(
        ERCWebSettingUri.EXTENSION_URI,
      );
    });

    it('should return extension entity', async () => {
      const res = await rcInfoSettings.getSettingById(
        SettingModuleIds.ExtensionSetting.id + Date.now(),
      );

      expect(res).toEqual(undefined);
    });
  });

  describe('getSettingsByParentId', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return empty setting when no parent id matched', async () => {
      const res = await rcInfoSettings.getSettingsByParentId(
        SettingModuleIds.PhoneSetting_General.id + Date.now(),
      );
      expect(res).toEqual([]);
    });

    it('should return all setting by parent id', async () => {
      rcInfoSettings[
        '_getRegionSettingVisibleState'
      ] = jest.fn().mockResolvedValue(0);
      rcInfoService.getCurrentCountry = jest
        .fn()
        .mockResolvedValue({ id: 1, callingCode: 'US' });
      const res = await rcInfoSettings.getSettingsByParentId(
        SettingModuleIds.PhoneSetting_General.id,
      );

      expect(res).toEqual([
        {
          id: SettingModuleIds.RegionSetting.id,
          parentModelId: SettingModuleIds.PhoneSetting_General.id,
          value: {
            areaCode: undefined,
            countryInfo: {
              callingCode: 'US',
              id: 1,
            },
          },
          valueType: 4,
          weight: SettingModuleIds.RegionSetting.weight,
          state: 0,
        },
        {
          id: SettingModuleIds.ExtensionSetting.id,
          parentModelId: SettingModuleIds.PhoneSetting_General.id,
          valueGetter: expect.anything(),
          valueType: 3,
          weight: SettingModuleIds.ExtensionSetting.weight,
          state: 0,
        },
      ]);
    });
  });

  describe('_getRegionSettingVisibleState', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return enable when has at lease 2 country list', async () => {
      rcInfoService.getCountryList = jest
        .fn()
        .mockResolvedValue([{ id: 1 }, { id: 2 }]);
      rcInfoService.hasAreaCode = jest.fn();
      const res = await rcInfoSettings['_getRegionSettingVisibleState']('US');
      expect(res).toEqual(ESettingItemState.ENABLE);
      expect(rcInfoService.hasAreaCode).not.toBeCalled();
    });

    it('should return enable when has 1 country and support area code ', async () => {
      rcInfoService.getCountryList = jest.fn().mockResolvedValue([{ id: 2 }]);
      rcInfoService.hasAreaCode = jest.fn().mockReturnValue(true);
      const res = await rcInfoSettings['_getRegionSettingVisibleState']('US');
      expect(res).toEqual(ESettingItemState.ENABLE);
      expect(rcInfoService.hasAreaCode).toBeCalled();
    });

    it('should return disable when has no dialing plan', async () => {
      rcInfoService.getCountryList = jest.fn().mockResolvedValue([]);
      rcInfoService.hasAreaCode = jest.fn();
      const res = await rcInfoSettings['_getRegionSettingVisibleState']('US');
      expect(res).toEqual(ESettingItemState.DISABLE);
      expect(rcInfoService.hasAreaCode).not.toBeCalled();
    });

    it('should return disable when has 1 country list and is not support area code', async () => {
      rcInfoService.getCountryList = jest.fn().mockResolvedValue([{ id: 1 }]);
      rcInfoService.hasAreaCode = jest.fn().mockReturnValue(false);
      const res = await rcInfoSettings['_getRegionSettingVisibleState']('PP');
      expect(res).toEqual(ESettingItemState.DISABLE);
      expect(rcInfoService.hasAreaCode).toBeCalled();
    });
  });
});
