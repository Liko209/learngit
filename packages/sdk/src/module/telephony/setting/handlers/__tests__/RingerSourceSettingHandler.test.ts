/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-06-25 09:11:53
 * Copyright © RingCentral. All rights reserved.
 */

import notificationCenter from 'sdk/service/notificationCenter';
import { RingerSourceSettingHandler } from '..';
import { SettingEntityIds, UserSettingEntity } from 'sdk/module/setting';
import RTCEngine, { RTC_MEDIA_ACTION } from 'voip';
import { TelephonyGlobalConfig } from 'sdk/module/telephony/config/TelephonyGlobalConfig';
import { TelephonyService } from 'sdk/module/telephony/service';
import { RC_INFO, SERVICE } from 'sdk/service/eventKey';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { RCInfoService } from 'sdk/module/rcInfo';
import { isChrome } from '../utils';
import { ESettingItemState } from 'sdk/framework/model/setting/types';
import { CONFIG_EVENT_TYPE } from 'sdk/module/config/constants';

jest.mock('../utils');
jest.mock('sdk/module/telephony/config/TelephonyGlobalConfig');
// jest.mock('sdk/module/telephony/service');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RingerSourceSettingHandler', () => {
  let mockRtcEngine: RTCEngine;
  let mockDefaultSettingItem: UserSettingEntity;
  let settingHandler: RingerSourceSettingHandler;
  let mockTelephonyService: TelephonyService;
  let rcInfoService: RCInfoService;
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
    const mockSource = [{ deviceId: 1 }, { deviceId: 2 }];
    mockDefaultSettingItem = {
      parentModelId: 0,
      weight: 0,
      valueType: 0,
      id: SettingEntityIds.Phone_RingerSource,
      source: mockSource,
      state: 0,
      value: { deviceId: 2 },
      valueSetter: expect.any(Function),
    };

    TelephonyGlobalConfig.prototype = {
      getCurrentRinger: jest.fn().mockReturnValue(1),
      setCurrentRinger: jest.fn(),
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
    mockRtcEngine = {
      getAudioInputs: jest.fn().mockReturnValue(mockSource),
      getAudioOutputs: jest.fn().mockReturnValue(mockSource),
    } as any;
    settingHandler = new RingerSourceSettingHandler(
      mockTelephonyService,
      mockRtcEngine,
    );
    settingHandler.notifyUserSettingEntityUpdate = jest.fn();
    settingHandler.getUserSettingEntity = jest.fn();
  }

  function cleanUp() {
    settingHandler.dispose();
    notificationCenter.removeAllListeners();
    clearMocks();
  }

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
        RTC_MEDIA_ACTION.OUTPUT_DEVICE_LIST_CHANGED,
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

      notificationCenter.emit(RTC_MEDIA_ACTION.OUTPUT_DEVICE_LIST_CHANGED, [
        {},
      ]);
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
    it('should not emit update when cache not exist', (done: jest.DoneCallback) => {
      settingHandler['userSettingEntityCache'] = undefined;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});
      settingHandler['_onSelectedDeviceUpdate'](
        CONFIG_EVENT_TYPE.UPDATE,
        '123',
      );
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).not.toBeCalled();
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
    it.each`
      devices                | isChromeValue | VoipCallPermission | RCFeaturePermission | expectRes
      ${[{ deviceId: '1' }]} | ${true}       | ${true}            | ${true}             | ${0}
      ${[{ deviceId: '1' }]} | ${true}       | ${true}            | ${false}            | ${0}
      ${[{ deviceId: '1' }]} | ${true}       | ${false}           | ${true}             | ${0}
      ${[{ deviceId: '1' }]} | ${true}       | ${false}           | ${false}            | ${2}
      ${[{ deviceId: '1' }]} | ${false}      | ${true}            | ${true}             | ${2}
      ${[{ deviceId: '1' }]} | ${false}      | ${true}            | ${false}            | ${2}
      ${[{ deviceId: '1' }]} | ${false}      | ${false}           | ${true}             | ${2}
      ${[{ deviceId: '1' }]} | ${false}      | ${false}           | ${false}            | ${2}
      ${[]}                  | ${true}       | ${true}            | ${true}             | ${1}
      ${[]}                  | ${false}      | ${true}            | ${true}             | ${2}
    `(
      'should get state is $expectRes when devices is $devices and chrome is $isChromeValue and VoipCallPermission is $VoipCallPermission and RCFeaturePermission is $RCFeaturePermission [JPT-2094]',
      async ({
        isChromeValue,
        devices,
        VoipCallPermission,
        RCFeaturePermission,
        expectRes,
      }) => {
        isChrome.mockReturnValue(isChromeValue);
        mockTelephonyService.getRingerDevicesList = jest
          .fn()
          .mockReturnValue(devices);
        mockTelephonyService.getVoipCallPermission.mockResolvedValue(
          VoipCallPermission,
        );
        rcInfoService.isRCFeaturePermissionEnabled.mockResolvedValue(
          RCFeaturePermission,
        );
        const result = await settingHandler.fetchUserSettingEntity();
        expect(result.state).toEqual(expectRes);
      },
    );

    it('should fetch entity correctly', async () => {
      TelephonyGlobalConfig.getCurrentRinger.mockReturnValue('a');
      const devices = [{ deviceId: 'a' }, { deviceId: 'b' }];
      mockTelephonyService.getRingerDevicesList = jest
        .fn()
        .mockReturnValue(devices);
      const res = await settingHandler.fetchUserSettingEntity();
      expect(res).toEqual({
        valueType: 0,
        weight: 0,
        parentModelId: 0,
        id: SettingEntityIds.Phone_RingerSource,
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
      expect(TelephonyGlobalConfig.setCurrentRinger).toBeCalledWith(111);
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
});
