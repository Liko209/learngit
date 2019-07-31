/*
 * @Author: Paynter Chen
 * @Date: 2019-05-26 21:42:27
 * Copyright © RingCentral. All rights reserved.
 */

import notificationCenter from 'sdk/service/notificationCenter';
import { SpeakerSourceSettingHandler } from '..';
import { SettingEntityIds, UserSettingEntity } from 'sdk/module/setting';
import RTCEngine, { RTC_MEDIA_ACTION } from 'voip';
import { TelephonyGlobalConfig } from 'sdk/module/telephony/config/TelephonyGlobalConfig';
import { TelephonyService } from 'sdk/module/telephony/service';
import { RC_INFO, SERVICE } from 'sdk/service/eventKey';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { RCInfoService } from 'sdk/module/rcInfo';
import { isChrome } from '../utils';
import { CONFIG_EVENT_TYPE } from 'sdk/module/config/constants';

jest.mock('../utils');
jest.mock('sdk/module/telephony/config/TelephonyGlobalConfig');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('SpeakerSourceSettingHandler', () => {
  let mockRtcEngine: RTCEngine;
  let mockDefaultSettingItem: UserSettingEntity;
  let settingHandler: SpeakerSourceSettingHandler;
  let mockTelephonyService: TelephonyService;
  let rcInfoService: RCInfoService;
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
    const mockSource = [{ deviceId: 1 }, { deviceId: 2 }];
    mockDefaultSettingItem = {
      id: SettingEntityIds.Phone_SpeakerSource,
      source: mockSource,
      state: 0,
      value: { deviceId: 2 },
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
    mockRtcEngine = {
      getAudioInputs: jest.fn().mockReturnValue(mockSource),
      getAudioOutputs: jest.fn().mockReturnValue(mockSource),
    } as any;
    settingHandler = new SpeakerSourceSettingHandler(
      mockTelephonyService,
      mockRtcEngine,
    );
    settingHandler.notifyUserSettingEntityUpdate = jest.fn();
    settingHandler.getUserSettingEntity = jest.fn();
    // settingHandler.on = jest.fn();
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
        mockRtcEngine.getAudioOutputs.mockReturnValue(devices);
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
      TelephonyGlobalConfig.getCurrentSpeaker.mockReturnValue('a');
      const devices = [{ deviceId: 'a' }, { deviceId: 'b' }];
      mockRtcEngine.getAudioOutputs.mockReturnValue(devices);
      const res = await settingHandler.fetchUserSettingEntity();
      expect(res).toEqual({
        id: SettingEntityIds.Phone_SpeakerSource,
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
      expect(TelephonyGlobalConfig.setCurrentSpeaker).toBeCalledWith(111);
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
