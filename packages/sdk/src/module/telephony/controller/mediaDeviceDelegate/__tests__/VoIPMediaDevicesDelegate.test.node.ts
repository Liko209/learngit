/*
 * @Author: Paynter Chen
 * @Date: 2019-05-26 21:42:27
 * Copyright © RingCentral. All rights reserved.
 */
import { VoIPMediaDevicesDelegate } from '../VoIPMediaDevicesDelegate';
import RTCEngine, { RTC_MEDIA_ACTION } from 'voip';
import { TelephonyGlobalConfig } from 'sdk/module/telephony/config/TelephonyGlobalConfig';
import { SOURCE_TYPE, RINGER_ADDITIONAL_TYPE } from '../types';
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
    delta: { added?: string[]; deleted?: string[], hashChanged?: boolean },
  ) {
    const idsToMockDevices = (ids: string[]): MediaDeviceInfo[] =>
      ids.map(deviceId => ({ deviceId } as MediaDeviceInfo));
    return {
      devices: idsToMockDevices(devices),
      delta: {
        hashChanged: !!delta.hashChanged,
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
        TELEPHONY_GLOBAL_KEYS.CURRENT_RINGER,
        expect.any(Function),
      );
      expect(TelephonyGlobalConfig.on).toHaveBeenNthCalledWith(
        4,
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

    it('should call ensureDevice when add/delete a device [JPT-2481]', () => {
      const deviceIds = ['a', 'b', 'c'];
      jest.spyOn(deviceDelegate['_speakerSyncManager'], 'ensureDevice');
      jest.spyOn(deviceDelegate['_microphoneSyncManager'], 'ensureDevice');
      jest.spyOn(deviceDelegate['_ringerSyncManager'], 'ensureDevice');
      deviceDelegate.onMediaDevicesChanged(
        createDevicesChangeInfo(deviceIds, { deleted: ['d'] }),
        createDevicesChangeInfo(deviceIds, { deleted: ['e'] }),
      );
      expect(deviceDelegate['_speakerSyncManager'].ensureDevice).toBeCalled();
      expect(
        deviceDelegate['_microphoneSyncManager'].ensureDevice,
      ).toBeCalled();
      expect(deviceDelegate['_ringerSyncManager'].ensureDevice).toBeCalled();
    });
    it('The default audio source setting should sync when I change the setting from the system [JPT-2497]', () => {
      const deviceIds = ['a', 'b', 'c'];
      jest.spyOn(deviceDelegate['_speakerSyncManager'], 'ensureDevice');
      jest.spyOn(deviceDelegate['_microphoneSyncManager'], 'ensureDevice');
      jest.spyOn(deviceDelegate['_ringerSyncManager'], 'ensureDevice');
      deviceDelegate.onMediaDevicesChanged(
        createDevicesChangeInfo(deviceIds, { hashChanged: true }),
        createDevicesChangeInfo(deviceIds, { hashChanged: true }),
      );
      expect(deviceDelegate['_speakerSyncManager'].ensureDevice).toBeCalled();
      expect(
        deviceDelegate['_microphoneSyncManager'].ensureDevice,
      ).toBeCalled();
      expect(deviceDelegate['_ringerSyncManager'].ensureDevice).toBeCalled();
    });
    it('should emit device change notification', () => {
      const deviceIds = ['a', 'b', 'c'];
      deviceDelegate.onMediaDevicesChanged(
        createDevicesChangeInfo(deviceIds, { added: ['c'] }),
        createDevicesChangeInfo(deviceIds, { added: ['a'] }),
      );
      expect(notificationCenter.emit).toBeCalled();
    });
    it('should not emit device change notification', () => {
      const deviceIds = ['a', 'b', 'c'];
      deviceDelegate.onMediaDevicesChanged(
        createDevicesChangeInfo(deviceIds, { added: [] }),
        createDevicesChangeInfo(deviceIds, { added: [] }),
      );
      expect(notificationCenter.emit).not.toBeCalled();
    });
    it('should not change when device change and current ringer is all/off', () => {
      const deviceIds = ['a', 'b', 'c'];
      jest.spyOn(deviceDelegate['_ringerSyncManager'], 'ensureDevice');
      TelephonyGlobalConfig.getCurrentRinger.mockReturnValue('all');
      deviceDelegate.onMediaDevicesChanged(
        createDevicesChangeInfo(deviceIds, { added: ['c'] }),
        createDevicesChangeInfo(deviceIds, { added: ['a'] }),
      );
      expect(notificationCenter.emit).toBeCalled();
      expect(
        deviceDelegate['_ringerSyncManager'].ensureDevice,
      ).not.toBeCalled();
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
      expect(TelephonyGlobalConfig.put).toBeCalledWith(
        TELEPHONY_GLOBAL_KEYS.CURRENT_SPEAKER,
        'a',
      );
    });
    it('should create DeviceSyncManager correctly', () => {
      deviceDelegate['_microphoneSyncManager'].setDevice({
        deviceId: 'a',
      } as any);
      expect(mockRtcEngine.setCurrentAudioInput).toBeCalledWith('a');
      expect(TelephonyGlobalConfig.put).toBeCalledWith(
        TELEPHONY_GLOBAL_KEYS.CURRENT_MICROPHONE,
        'a',
      );
    });
    it('should create DeviceSyncManager correctly', () => {
      deviceDelegate['_ringerSyncManager'].setDevice({
        deviceId: 'a',
      } as any);
      expect(deviceDelegate['_currentRingerId']).toEqual('a');
      expect(TelephonyGlobalConfig.put).toBeCalledWith(
        TELEPHONY_GLOBAL_KEYS.CURRENT_RINGER,
        'a',
      );
    });
  });

  describe('getRingerDevicesList', () => {
    const devices = [
      {
        deviceId: 'default',
      },
      {
        deviceId: '1',
      },
    ];
    it('should return empty array when devices are empty array', () => {
      mockRtcEngine.getAudioOutputs = jest.fn().mockReturnValue([]);
      const result = deviceDelegate.getRingerDevicesList();
      expect(result).toEqual([]);
    });
    it('should return device list when devices have value [JPT-2432]', () => {
      mockRtcEngine.getAudioOutputs = jest.fn().mockReturnValue(devices);
      const result = deviceDelegate.getRingerDevicesList();
      expect(result.length).toEqual(devices.length + 2);
    });

    it('should return last value is off and second to last is all when devices have value [JPT-2434]', () => {
      mockRtcEngine.getAudioOutputs = jest.fn().mockReturnValue(devices);
      const result = deviceDelegate.getRingerDevicesList();
      expect(result[result.length - 1].deviceId).toEqual(
        RINGER_ADDITIONAL_TYPE.OFF,
      );
      expect(result[result.length - 2].deviceId).toEqual(
        RINGER_ADDITIONAL_TYPE.ALL,
      );
    });
  });
});
