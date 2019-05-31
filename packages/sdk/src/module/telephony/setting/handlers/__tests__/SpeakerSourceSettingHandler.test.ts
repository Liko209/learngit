/*
 * @Author: Paynter Chen
 * @Date: 2019-05-26 21:42:27
 * Copyright © RingCentral. All rights reserved.
 */

import notificationCenter from 'sdk/service/notificationCenter';
import { SpeakerSourceSettingHandler } from '..';
import { SettingEntityIds, UserSettingEntity } from 'sdk/module/setting';
import { TelephonyUserConfig } from 'sdk/module/telephony/config/TelephonyUserConfig';
import RTCEngine, { RTC_MEDIA_ACTION } from 'voip/src';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('SpeakerSourceSettingHandler', () => {
  let mockUserConfig: TelephonyUserConfig;
  let mockRtcEngine: RTCEngine;
  let mockDefaultSettingItem: UserSettingEntity;
  let settingHandler: SpeakerSourceSettingHandler;
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
    const mockSource = [{ deviceId: 1 }, { deviceId: 2 }];
    mockDefaultSettingItem = {
      parentModelId: 0,
      weight: 0,
      valueType: 0,
      id: SettingEntityIds.Phone_SpeakerSource,
      source: mockSource,
      state: 0,
      value: { deviceId: 2 },
      valueSetter: expect.any(Function),
    };
    mockUserConfig = {
      getCurrentSpeaker: jest.fn().mockReturnValue(1),
      setCurrentSpeaker: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    } as any;
    mockRtcEngine = {
      getAudioInputs: jest.fn().mockReturnValue(mockSource),
      getAudioOutputs: jest.fn().mockReturnValue(mockSource),
    } as any;
    settingHandler = new SpeakerSourceSettingHandler(
      mockUserConfig,
      mockRtcEngine,
    );
    settingHandler.notifyUserSettingEntityUpdate = jest.fn();
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

      notificationCenter.emit(RTC_MEDIA_ACTION.OUTPUT_DEVICES_CHANGED, [{}]);
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).toBeCalled();
        expect(
          settingHandler.notifyUserSettingEntityUpdate,
        ).toHaveBeenCalledWith({});
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
    it('should emit update when device change', (done: jest.DoneCallback) => {
      mockDefaultSettingItem.value = { deviceId: 3 };
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});
      settingHandler['_onSelectedDeviceUpdate']({ deviceId: 123 } as any);
      expect(settingHandler.getUserSettingEntity).toBeCalled();
      setTimeout(() => {
        expect(
          settingHandler.notifyUserSettingEntityUpdate,
        ).toHaveBeenCalledWith({});
        done();
      });
    });
    it('should not emit update when device not change', (done: jest.DoneCallback) => {
      mockDefaultSettingItem.value = { deviceId: 123 };
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});
      settingHandler['_onSelectedDeviceUpdate'](({
        deviceId: 123,
      } as any) as MediaDeviceInfo);
      expect(settingHandler.getUserSettingEntity).not.toBeCalled();
      setTimeout(() => {
        expect(settingHandler.notifyUserSettingEntityUpdate).not.toBeCalled();
        done();
      });
    });
    it('should not emit update when cache not exist', (done: jest.DoneCallback) => {
      settingHandler['userSettingEntityCache'] = undefined;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});
      settingHandler['_onSelectedDeviceUpdate'](({
        deviceId: 123,
      } as any) as MediaDeviceInfo);
      setTimeout(() => {
        expect(settingHandler.notifyUserSettingEntityUpdate).not.toBeCalled();
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
    it('should fetch entity correctly', async () => {
      mockUserConfig.getCurrentSpeaker.mockReturnValue('a');
      const devices = [{ deviceId: 'a' }, { deviceId: 'b' }];
      mockRtcEngine.getAudioOutputs.mockReturnValue(devices);
      const res = await settingHandler.fetchUserSettingEntity();
      expect(res).toEqual({
        valueType: 0,
        weight: 0,
        parentModelId: 0,
        id: SettingEntityIds.Phone_SpeakerSource,
        source: devices,
        state: 0,
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
      expect(mockUserConfig.setCurrentSpeaker).toBeCalledWith(111);
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
