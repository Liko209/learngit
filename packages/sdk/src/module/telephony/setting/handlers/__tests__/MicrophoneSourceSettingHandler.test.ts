/*
 * @Author: Paynter Chen
 * @Date: 2019-05-26 21:42:27
 * Copyright © RingCentral. All rights reserved.
 */

import notificationCenter from 'sdk/service/notificationCenter';
import { MicrophoneSourceSettingHandler } from '../';
import { SettingEntityIds, UserSettingEntity } from 'sdk/module/setting';
import { TelephonyGlobalConfig } from 'sdk/module/telephony/config/TelephonyGlobalConfig';
import RTCEngine, { RTC_MEDIA_ACTION } from 'voip/src';
import { RC_INFO, SERVICE } from 'sdk/service/eventKey';
import { isChrome } from '../utils';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { ESettingItemState } from 'sdk/framework/model/setting/types';
import { TelephonyService } from 'sdk/module/telephony/service/TelephonyService';
import { CONFIG_EVENT_TYPE } from 'sdk/module/config/constants';

jest.mock('../utils');
jest.mock('sdk/module/telephony/config/TelephonyGlobalConfig');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('MicrophoneSourceSettingHandler', () => {
  let mockRtcEngine: RTCEngine;
  let mockDefaultSettingItem: UserSettingEntity;
  let settingHandler: MicrophoneSourceSettingHandler;
  let mockTelephonyService: TelephonyService;
  let rcInfoService: RCInfoService;
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
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
    const mockSource = [{ deviceId: 1 }, { deviceId: 2 }];
    mockDefaultSettingItem = {
      parentModelId: 0,
      weight: 0,
      valueType: 0,
      id: SettingEntityIds.Phone_MicrophoneSource,
      source: mockSource,
      state: 0,
      value: { deviceId: 2 },
      valueSetter: expect.any(Function),
    };
    mockTelephonyService = {
      getVoipCallPermission: jest.fn(),
    } as any;
    mockRtcEngine = {
      getAudioInputs: jest.fn().mockReturnValue(mockSource),
      getAudioOutputs: jest.fn().mockReturnValue(mockSource),
    } as any;
    settingHandler = new MicrophoneSourceSettingHandler(
      mockTelephonyService,
      mockRtcEngine,
    );
    settingHandler.notifyUserSettingEntityUpdate = jest.fn();
    settingHandler.getUserSettingEntity = jest.fn();
  }

  function cleanUp() {
    clearMocks();
    settingHandler.dispose();
  }

  beforeEach(() => {
    setUp();
  });

  afterEach(() => {
    cleanUp();
  });

  describe('constructor()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });

    it('should subscribe', () => {
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
      expect(notificationCenter.on).toBeCalledWith(
        RTC_MEDIA_ACTION.INPUT_DEVICE_LIST_CHANGED,
        expect.any(Function),
      );
    });
  });
  describe('onDevicesChange()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should emit update when devices change', (done: jest.DoneCallback) => {
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});

      notificationCenter.emit(RTC_MEDIA_ACTION.INPUT_DEVICE_LIST_CHANGED, [{}]);
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).toBeCalled();

        done();
      });
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
        expect(settingHandler.getUserSettingEntity).not.toBeCalled();
        done();
      });
    });

    it('should emit update when devices change', (done: jest.DoneCallback) => {
      isChrome.mockReturnValue(true);
      settingHandler['_onPermissionChange']();
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).toBeCalled();
        done();
      });
    });
  });

  describe('_onSelectedDeviceUpdate()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should emit update when device change', () => {
      mockDefaultSettingItem.value = { deviceId: '3' };
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});
      settingHandler['_onSelectedDeviceUpdate'](
        CONFIG_EVENT_TYPE.UPDATE,
        '123',
      );
      expect(settingHandler.getUserSettingEntity).toBeCalled();
    });
    it('should not emit update when device not change', () => {
      mockDefaultSettingItem.value = { deviceId: '123' };
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});
      settingHandler['_onSelectedDeviceUpdate'](
        CONFIG_EVENT_TYPE.UPDATE,
        '123',
      );
      expect(settingHandler.getUserSettingEntity).not.toBeCalled();
    });
    it('should not emit update when cache not exist', () => {
      settingHandler['userSettingEntityCache'] = undefined;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});
      settingHandler['_onSelectedDeviceUpdate'](
        CONFIG_EVENT_TYPE.UPDATE,
        '123',
      );
      expect(settingHandler.getUserSettingEntity).not.toBeCalled();
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
      TelephonyGlobalConfig.getCurrentMicrophone.mockReturnValue('a');
      const devices = [{ deviceId: 'a' }, { deviceId: 'b' }];
      mockRtcEngine.getAudioInputs.mockReturnValue(devices);
      const res = await settingHandler.fetchUserSettingEntity();
      expect(res).toEqual({
        valueType: 0,
        weight: 0,
        parentModelId: 0,
        id: SettingEntityIds.Phone_MicrophoneSource,
        source: devices,
        state: expect.any(Number),
        value: { deviceId: 'a' },
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
      await settingHandler.updateValue({
        deviceId: 111,
      } as any);
      expect(TelephonyGlobalConfig.setCurrentMicrophone).toBeCalledWith(111);
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

    it('JPT-2094 Show "Audio sources" section only for chrome/electron with meeting/call/conference permission', async () => {
      isChrome.mockReturnValue(true);
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
      isChrome.mockReturnValue(false);
      mockTelephonyService.getVoipCallPermission.mockResolvedValue(true);
      rcInfoService.isRCFeaturePermissionEnabled.mockResolvedValue(true);
      expect(await settingHandler['_getEntityState']()).toEqual(
        ESettingItemState.INVISIBLE,
      );
    });
  });
});
