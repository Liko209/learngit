/*
 * @Author: Paynter Chen
 * @Date: 2019-05-26 21:42:27
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import notificationCenter from 'sdk/service/notificationCenter';
import { SettingEntityIds, UserSettingEntity } from 'sdk/module/setting';
import 'sdk/module/profile/service/ProfileService';
import 'sdk/module/telephony/service/TelephonyService';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { TelephonyGlobalConfig } from 'sdk/module/telephony/config/TelephonyGlobalConfig';
import { VolumeSettingHandler } from '../VolumeSettingHandler';
import { TELEPHONY_GLOBAL_KEYS } from 'sdk/module/telephony/config/configKeys';
import { RC_INFO, SERVICE } from 'sdk/service/eventKey';
import { isChrome } from '../utils';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { TelephonyService } from 'sdk/module/telephony/service/TelephonyService';
import { RTC_MEDIA_ACTION } from 'voip/src';

jest.mock('../utils');
jest.mock('sdk/module/telephony/config/TelephonyGlobalConfig');
function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('DefaultAppSettingHandler', () => {
  let mockDefaultSettingItem: UserSettingEntity;
  let settingHandler: VolumeSettingHandler;
  let mockTelephonyService: TelephonyService;
  let rcInfoService: RCInfoService;
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    mockDefaultSettingItem = {
      weight: 0,
      valueType: 0,
      parentModelId: 0,
      id: SettingEntityIds.Phone_Volume,
      value: 50,
      state: ESettingItemState.ENABLE,
      valueSetter: expect.any(Function),
    };

    TelephonyGlobalConfig.prototype = {
      getCurrentSpeaker: jest.fn().mockReturnValue(1),
      setCurrentSpeaker: jest.fn(),
      getCurrentMicrophone: jest.fn().mockReturnValue(1),
      setCurrentMicrophone: jest.fn(),
      getCurrentVolume: jest.fn().mockReturnValue(1),
      setCurrentVolume: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    };
    rcInfoService = {
      isRCFeaturePermissionEnabled: jest.fn().mockResolvedValue(true),
    } as any;
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((serviceName: string) => {
        return rcInfoService;
      });

    mockTelephonyService = {
      getVoipCallPermission: jest.fn(),
    } as any;
    settingHandler = new VolumeSettingHandler(mockTelephonyService);
    settingHandler.notifyUserSettingEntityUpdate = jest.fn();
  }

  function cleanUp() {
    settingHandler.dispose();
    clearMocks();
  }

  describe('constructor', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should subscribe notification when create self', () => {
      expect(TelephonyGlobalConfig.on).toHaveBeenCalledWith(
        TELEPHONY_GLOBAL_KEYS.CURRENT_VOLUME,
        expect.any(Function),
      );
      expect(notificationCenter.on).toBeCalledWith(
        RC_INFO.EXTENSION_INFO,
        expect.any(Function),
      );
      expect(notificationCenter.on).toBeCalledWith(
        RC_INFO.ROLE_PERMISSIONS,
        expect.any(Function),
      );
      expect(notificationCenter.on).toBeCalledWith(
        SERVICE.TELEPHONY_SERVICE.VOIP_CALLING,
        expect.any(Function),
      );
    });
  });

  describe('onPermissionChange()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should emit update when devices change', (done: jest.DoneCallback) => {
      isChrome.mockReturnValue(false);
      settingHandler['_onPermissionChange']();
      setTimeout(() => {
        expect(settingHandler.notifyUserSettingEntityUpdate).not.toBeCalled();
        done();
      });
    });

    it('should emit update when devices change', (done: jest.DoneCallback) => {
      isChrome.mockReturnValue(true);
      settingHandler['_onPermissionChange']();
      setTimeout(() => {
        expect(settingHandler.notifyUserSettingEntityUpdate).toBeCalled();
        done();
      });
    });
  });

  describe('_onVolumeUpdate()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should emit update when update', (done: jest.DoneCallback) => {
      mockDefaultSettingItem.value = 50;
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});
      settingHandler['_onVolumeUpdate'](11);
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).toBeCalled();
        expect(
          settingHandler.notifyUserSettingEntityUpdate,
        ).toHaveBeenCalledWith({});
        done();
      });
    });

    it('should not emit update when no change', (done: jest.DoneCallback) => {
      mockDefaultSettingItem.value = 50;
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});
      settingHandler['_onVolumeUpdate'](50);

      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).not.toBeCalled();
        expect(settingHandler.notifyUserSettingEntityUpdate).not.toBeCalled();
        done();
      });
    });

    it('should not emit when has no cache', (done: jest.DoneCallback) => {
      settingHandler['userSettingEntityCache'] = undefined;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});
      settingHandler['_onVolumeUpdate'](11);

      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).not.toBeCalled();
        expect(settingHandler.notifyUserSettingEntityUpdate).not.toBeCalled();
        done();
      });
    });
  });
  describe('fetchUserSettingEntity()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should fetch entity correctly', async () => {
      TelephonyGlobalConfig.getCurrentVolume.mockReturnValue(22);
      const res = await settingHandler.fetchUserSettingEntity();
      expect(res).toEqual({
        valueType: 0,
        weight: 0,
        parentModelId: 0,
        id: SettingEntityIds.Phone_Volume,
        state: expect.any(Number),
        value: 22,
        valueSetter: expect.any(Function),
      });
    });
  });

  describe('updateValue()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });

    it('should call userConfig.set', async () => {
      await settingHandler.updateValue(33);
      expect(TelephonyGlobalConfig.setCurrentVolume).toBeCalledWith('33');
    });
  });

  describe('dispose()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });

    it('should call off userConfig', () => {
      settingHandler.dispose();
      expect(TelephonyGlobalConfig.off).toBeCalled();
    });
  });

  describe('getEntityState()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });

    it('should return true when 1 of them(call, conference, meeting) meet', async () => {
      isChrome.mockRejectedValue(true);
      mockTelephonyService.getVoipCallPermission.mockResolvedValue(true);
      rcInfoService.isRCFeaturePermissionEnabled.mockResolvedValue(true);
      expect(await settingHandler['_getEntityState']()).toEqual(
        ESettingItemState.ENABLE,
      );
      mockTelephonyService.getVoipCallPermission.mockResolvedValue(false);
      rcInfoService.isRCFeaturePermissionEnabled.mockResolvedValue(true);
      expect(await settingHandler['_getEntityState']()).toEqual(
        ESettingItemState.ENABLE,
      );
      mockTelephonyService.getVoipCallPermission.mockResolvedValue(false);
      rcInfoService.isRCFeaturePermissionEnabled.mockResolvedValue(false);
      expect(await settingHandler['_getEntityState']()).toEqual(
        ESettingItemState.INVISIBLE,
      );
    });
  });
});
