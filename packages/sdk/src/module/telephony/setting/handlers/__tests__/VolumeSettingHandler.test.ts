/*
 * @Author: Paynter Chen
 * @Date: 2019-05-26 21:42:27
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { RC_INFO, ENTITY, SERVICE } from 'sdk/service';
import notificationCenter from 'sdk/service/notificationCenter';
import {
  ESettingValueType,
  SettingEntityIds,
  UserSettingEntity,
} from 'sdk/module/setting';
import { SettingModuleIds } from 'sdk/module/setting/constants';
import { DefaultAppSettingHandler } from '../handlers/VolumeSettingHandler';
import 'sdk/module/profile/service/ProfileService';
import 'sdk/module/telephony/service/TelephonyService';
import { spyOnTarget } from 'sdk/__tests__/utils';
import { ProfileService } from 'sdk/module/profile/service/ProfileService';
import { TelephonyService } from 'sdk/module/telephony/service/TelephonyService';
import { AccountService } from 'sdk/module/account';
import { Profile } from '../../entity';
import { CALLING_OPTIONS, SETTING_KEYS } from '../../constants';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { TelephonyUserConfig } from 'sdk/module/telephony/config/TelephonyUserConfig';
import RTCEngine from 'voip/src';
import { MicrophoneSourceSettingHandler } from '..';
import { VolumeSettingHandler } from '../VolumeSettingHandler';
import { TELEPHONY_KEYS } from 'sdk/module/telephony/config/configKeys';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('DefaultAppSettingHandler', () => {
  let mockUserConfig: TelephonyUserConfig;
  let mockRtcEngine: RTCEngine;
  let mockDefaultSettingItem: UserSettingEntity;
  let settingHandler: VolumeSettingHandler;
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
    mockUserConfig = {
      getCurrentVolume: jest.fn().mockReturnValue(1),
      setCurrentVolume: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    } as any;
    settingHandler = new VolumeSettingHandler(mockUserConfig);
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
      expect(mockUserConfig.on).toHaveBeenCalledWith(
        TELEPHONY_KEYS.CURRENT_VOLUME,
        expect.any(Function),
      );
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
      mockUserConfig.getCurrentVolume.mockReturnValue(22);
      const res = await settingHandler.fetchUserSettingEntity();
      expect(res).toEqual({
        valueType: 0,
        weight: 0,
        parentModelId: 0,
        id: SettingEntityIds.Phone_Volume,
        state: 0,
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
      expect(mockUserConfig.setCurrentVolume).toBeCalledWith('33');
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
      expect(mockUserConfig.off).toBeCalled();
    });
  });
});
