/*
 * @Author: Paynter Chen
 * @Date: 2019-05-26 21:42:27
 * Copyright © RingCentral. All rights reserved.
 */

import { ESettingItemState } from 'sdk/framework/model/setting';
import notificationCenter from '../../../../service/notificationCenter';
import { IRCInfoService } from '../../service/IRCInfoService';
import { SettingModuleIds } from '../../../setting/constants';
import {
  ESettingValueType,
  UserSettingEntity,
  SettingEntityIds,
} from '../../../setting';
import { RegionSettingHandler } from '../RegionSettingHandler';
import { RC_INFO } from 'sdk/service';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RegionSettingHandler', () => {
  let rcInfoService: IRCInfoService;
  let settingHandler: RegionSettingHandler;
  let mockDefaultSettingItem: UserSettingEntity;

  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
    rcInfoService = {
      generateWebSettingUri: (type: any) => {},
      getCurrentCountry: () => {},
      getAreaCode: () => {},
      getCountryList: () => {},
      hasAreaCode: () => {},
    } as any;
    mockDefaultSettingItem = {
      id: SettingEntityIds.Phone_Extension,
      parentModelId: SettingModuleIds.PhoneSetting_General.id,
      valueGetter: expect.anything(),
      valueType: 3,
      weight: SettingModuleIds.ExtensionSetting.weight,
      state: 0,
    };
    settingHandler = new RegionSettingHandler(rcInfoService);
    settingHandler.notifyUserSettingEntityUpdate = jest.fn();
  }

  function cleanUp() {
    settingHandler.dispose();
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  afterEach(() => {
    cleanUp();
  });

  describe('constructor', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });
    afterEach(() => {
      cleanUp();
    });
    it('should subscribe notification when create self', () => {
      expect(notificationCenter.on).toHaveBeenCalledWith(
        RC_INFO.RC_REGION_INFO,
        expect.any(Function),
      );
    });
  });

  describe('handleUpdated', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });
    afterEach(() => {
      cleanUp();
    });
    it('should emit update when has cache && subscribe update', (done: jest.DoneCallback) => {
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});

      notificationCenter.emitEntityUpdate(RC_INFO.RC_REGION_INFO, [
        {
          id: 1,
        },
      ]);
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).toBeCalled();
        expect(
          settingHandler.notifyUserSettingEntityUpdate,
        ).toHaveBeenCalledWith({});
        done();
      });
    });

    it('should not emit when has no cache', (done: jest.DoneCallback) => {
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});

      notificationCenter.emitEntityUpdate(RC_INFO.RC_REGION_INFO, [
        {
          id: 1,
        },
      ]);
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).not.toBeCalled();
        expect(settingHandler.notifyUserSettingEntityUpdate).not.toBeCalled();
        done();
      });
    });
  });

  describe('fetchUserSettingEntity()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should return region setting entity with disabled state when has no dialing plan country ', async () => {
      rcInfoService.getAreaCode = jest.fn().mockResolvedValue('650');
      rcInfoService.getCurrentCountry = jest
        .fn()
        .mockResolvedValue({ id: 1, callingCode: 'us' });
      rcInfoService.getCountryList = jest.fn().mockReturnValue([]);
      const res = await settingHandler.fetchUserSettingEntity();
      expect(res).toEqual({
        id: SettingEntityIds.Phone_Region,
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
  });

  describe('updateValue()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });

    it('should do nothing', async () => {
      await settingHandler.updateValue({
        id: 111,
      } as any);
      expect(1).toEqual(1);
    });
  });

  describe('_getRegionSettingVisibleState', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });
    afterEach(() => {
      cleanUp();
    });

    it('should return enable when has at lease 2 country list', async () => {
      rcInfoService.getCountryList = jest
        .fn()
        .mockResolvedValue([{ id: 1 }, { id: 2 }]);
      rcInfoService.hasAreaCode = jest.fn();
      const res = await settingHandler['_getRegionSettingVisibleState']('US');
      expect(res).toEqual(ESettingItemState.ENABLE);
      expect(rcInfoService.hasAreaCode).not.toBeCalled();
    });

    it('should return enable when has 1 country and support area code ', async () => {
      rcInfoService.getCountryList = jest.fn().mockResolvedValue([{ id: 2 }]);
      rcInfoService.hasAreaCode = jest.fn().mockReturnValue(true);
      const res = await settingHandler['_getRegionSettingVisibleState']('US');
      expect(res).toEqual(ESettingItemState.ENABLE);
      expect(rcInfoService.hasAreaCode).toBeCalled();
    });

    it('should return disable when has no dialing plan', async () => {
      rcInfoService.getCountryList = jest.fn().mockResolvedValue([]);
      rcInfoService.hasAreaCode = jest.fn();
      const res = await settingHandler['_getRegionSettingVisibleState']('US');
      expect(res).toEqual(ESettingItemState.DISABLE);
      expect(rcInfoService.hasAreaCode).not.toBeCalled();
    });

    it('should return disable when has 1 country list and is not support area code', async () => {
      rcInfoService.getCountryList = jest.fn().mockResolvedValue([{ id: 1 }]);
      rcInfoService.hasAreaCode = jest.fn().mockReturnValue(false);
      const res = await settingHandler['_getRegionSettingVisibleState']('PP');
      expect(res).toEqual(ESettingItemState.DISABLE);
      expect(rcInfoService.hasAreaCode).toBeCalled();
    });
  });
});
