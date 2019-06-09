/*
 * @Author: Paynter Chen
 * @Date: 2019-05-26 21:42:27
 * Copyright © RingCentral. All rights reserved.
 */
import { VoIPMediaDevicesDelegate } from '../VoIPMediaDevicesDelegate';
import RTCEngine, { RTC_MEDIA_ACTION } from 'voip';
import { TelephonyGlobalConfig } from 'sdk/module/telephony/config/TelephonyGlobalConfig';
import { SOURCE_TYPE } from '../types';
import { TELEPHONY_GLOBAL_KEYS } from 'sdk/module/telephony/config/configKeys';
import notificationCenter from 'sdk/service/notificationCenter';

jest.mock('voip/src/api/RTCEngine');
jest.mock('sdk/module/telephony/config/TelephonyGlobalConfig');
jest.mock('sdk/service/notificationCenter');

describe('VoIPMediaDevicesDelegate', () => {
  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }

  let deviceDelegate: VoIPMediaDevicesDelegate;
  let mockSource: MediaDeviceInfo;
  let mockRtcEngine: RTCEngine;
  function setUp() {
    TelephonyGlobalConfig.prototype = {
      getCurrentSpeaker: jest.fn().mockReturnValue(1),
      setCurrentSpeaker: jest.fn(),
      getCurrentMicrophone: jest.fn().mockReturnValue(1),
      setCurrentMicrophone: jest.fn(),
      getCurrentVolume: jest.fn().mockReturnValue('22'),
      setCurrentVolume: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    };
    mockSource = [{ deviceId: 1 }, { deviceId: 2 }] as any;
    mockRtcEngine = new RTCEngine();
    mockRtcEngine.getAudioInputs.mockReturnValue(mockSource);
    mockRtcEngine.getAudioOutputs.mockReturnValue(mockSource);

    deviceDelegate = new VoIPMediaDevicesDelegate(mockRtcEngine);
  }

  function cleanUp() {
    clearMocks();
  }

  function createDevicesChangeInfo(
    devices: string[],
    delta: { added?: string[]; deleted?: string[] },
  ) {
    const idsToMockDevices = (ids: string[]): MediaDeviceInfo[] =>
      ids.map(deviceId => ({ deviceId } as MediaDeviceInfo));
    return {
      devices: idsToMockDevices(devices),
      delta: {
        added: idsToMockDevices(delta.added || []),
        deleted: idsToMockDevices(delta.deleted || []),
      },
    };
  }

  describe('constructor()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });

    it('should init value from storage', () => {
      TelephonyGlobalConfig.getCurrentVolume.mockReturnValue('22');
      deviceDelegate = new VoIPMediaDevicesDelegate(mockRtcEngine);
      expect(mockRtcEngine.setVolume).toBeCalledWith(22);
    });

    it('should init value from DEFAULT when storage not exists', () => {
      TelephonyGlobalConfig.getCurrentVolume.mockReturnValue(undefined);
      deviceDelegate = new VoIPMediaDevicesDelegate(mockRtcEngine);
      expect(TelephonyGlobalConfig.setCurrentVolume).toBeCalledWith('0.5');
      expect(mockRtcEngine.setVolume).toBeCalledWith(0.5);
    });

    it('should subscribe to key change', () => {
      expect(TelephonyGlobalConfig.on).toHaveBeenNthCalledWith(
        1,
        TELEPHONY_GLOBAL_KEYS.CURRENT_MICROPHONE,
        expect.any(Function),
      );
      expect(TelephonyGlobalConfig.on).toHaveBeenNthCalledWith(
        2,
        TELEPHONY_GLOBAL_KEYS.CURRENT_SPEAKER,
        expect.any(Function),
      );
      expect(TelephonyGlobalConfig.on).toHaveBeenNthCalledWith(
        3,
        TELEPHONY_GLOBAL_KEYS.CURRENT_VOLUME,
        expect.any(Function),
      );
      expect(notificationCenter.on).toBeCalledWith(
        RTC_MEDIA_ACTION.VOLUME_CHANGED,
        expect.any(Function),
      );
    });
  });

  describe('onVolumeChanged()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should update volume to storage when volume change', () => {
      TelephonyGlobalConfig.getCurrentVolume.mockReturnValue('1');
      deviceDelegate['_handleVolumeChanged'](22);
      expect(TelephonyGlobalConfig.setCurrentVolume).toBeCalledWith('22');
    });
    it('should not update volume to storage when volume not change', () => {
      TelephonyGlobalConfig.setCurrentVolume.mockReset();
      TelephonyGlobalConfig.getCurrentVolume.mockReturnValue('22');
      deviceDelegate['_handleVolumeChanged'](22);
      expect(TelephonyGlobalConfig.setCurrentVolume).not.toBeCalled();
    });
  });

  describe('onMediaDevicesChanged()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });

    it('should use new devices', () => {
      deviceDelegate['_speakerSyncManager'].setDevice = jest.fn();
      deviceDelegate['_microphoneSyncManager'].setDevice = jest.fn();
      const deviceIds = ['a', 'b', 'c'];
      deviceDelegate.onMediaDevicesChanged(
        createDevicesChangeInfo(deviceIds, { added: ['c'] }),
        createDevicesChangeInfo(deviceIds, { added: ['a'] }),
      );
      expect(deviceDelegate['_speakerSyncManager'].setDevice).toBeCalledWith({
        source: SOURCE_TYPE.NEW_DEVICE,
        deviceId: 'c',
      });
      expect(deviceDelegate['_microphoneSyncManager'].setDevice).toBeCalledWith(
        {
          source: SOURCE_TYPE.NEW_DEVICE,
          deviceId: 'a',
        },
      );
    });

    it('should re ensure device', () => {
      const deviceIds = ['a', 'b', 'c'];
      jest.spyOn(deviceDelegate['_speakerSyncManager'], 'ensureDevice');
      jest.spyOn(deviceDelegate['_microphoneSyncManager'], 'ensureDevice');
      deviceDelegate.onMediaDevicesChanged(
        createDevicesChangeInfo(deviceIds, { deleted: ['d'] }),
        createDevicesChangeInfo(deviceIds, { deleted: ['e'] }),
      );
      expect(deviceDelegate['_speakerSyncManager'].ensureDevice).toBeCalled();
      expect(
        deviceDelegate['_microphoneSyncManager'].ensureDevice,
      ).toBeCalled();
    });
  });

  describe('onMediaDevicesInitialed', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });

    it('should call onMediaDevicesInitialed', () => {
      jest.clearAllMocks();
      jest.spyOn(deviceDelegate, '_initDevicesState');
      deviceDelegate.onMediaDevicesInitialed();
      expect(deviceDelegate['_initDevicesState']).toBeCalled();
    });
  });

  describe('DeviceSyncManager', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });

    it('should create DeviceSyncManager correctly', () => {
      deviceDelegate['_speakerSyncManager'].setDevice({
        deviceId: 'a',
      } as any);
      expect(mockRtcEngine.setCurrentAudioOutput).toBeCalledWith('a');
      expect(TelephonyGlobalConfig.setCurrentSpeaker).toBeCalledWith('a');
    });
    it('should create DeviceSyncManager correctly', () => {
      deviceDelegate['_microphoneSyncManager'].setDevice({
        deviceId: 'a',
      } as any);
      expect(mockRtcEngine.setCurrentAudioInput).toBeCalledWith('a');
      expect(TelephonyGlobalConfig.setCurrentMicrophone).toBeCalledWith('a');
    });
  });
});
