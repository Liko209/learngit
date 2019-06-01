/*
 * @Author: Paynter Chen
 * @Date: 2019-05-26 21:42:27
 * Copyright © RingCentral. All rights reserved.
 */
import { VoIPMediaDevicesDelegate } from '../VoIPMediaDevicesDelegate';
import RTCEngine from 'voip';
import { TelephonyUserConfig } from 'sdk/module/telephony/config/TelephonyUserConfig';
import { SOURCE_TYPE } from '../types';
import { TELEPHONY_KEYS } from 'sdk/module/telephony/config/configKeys';

jest.mock('voip/src/api/RTCEngine');
jest.mock('sdk/module/telephony/config/TelephonyUserConfig');

describe('VoIPMediaDevicesDelegate', () => {
  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }

  let deviceDelegate: VoIPMediaDevicesDelegate;
  let mockUserConfig: TelephonyUserConfig;
  let mockSource: MediaDeviceInfo;
  let mockRtcEngine: RTCEngine;

  function setUp() {
    mockUserConfig = new TelephonyUserConfig();
    mockUserConfig.getCurrentVolume.mockReturnValue('22');
    mockSource = [{ deviceId: 1 }, { deviceId: 2 }] as any;

    mockRtcEngine = new RTCEngine();
    mockRtcEngine.getAudioInputs.mockReturnValue(mockSource);
    mockRtcEngine.getAudioOutputs.mockReturnValue(mockSource);

    deviceDelegate = new VoIPMediaDevicesDelegate(
      mockUserConfig,
      mockRtcEngine,
    );
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
      expect(mockRtcEngine.setVolume).toBeCalledWith(22);
    });

    it('should init value from DEFAULT when storage not exists', () => {
      mockUserConfig.getCurrentVolume.mockReturnValue(undefined);
      deviceDelegate = new VoIPMediaDevicesDelegate(
        mockUserConfig,
        mockRtcEngine,
      );
      expect(mockRtcEngine.setVolume).toBeCalledWith(50);
    });

    it('should subscribe to key change', () => {
      expect(mockUserConfig.on).toHaveBeenNthCalledWith(
        1,
        TELEPHONY_KEYS.CURRENT_MICROPHONE,
        expect.any(Function),
      );
      expect(mockUserConfig.on).toHaveBeenNthCalledWith(
        2,
        TELEPHONY_KEYS.CURRENT_SPEAKER,
        expect.any(Function),
      );
      expect(mockUserConfig.on).toHaveBeenNthCalledWith(
        3,
        TELEPHONY_KEYS.CURRENT_VOLUME,
        expect.any(Function),
      );
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
      deviceDelegate['_speakerConfigManager'].setDevice = jest.fn();
      deviceDelegate['_microphoneConfigManager'].setDevice = jest.fn();
      const deviceIds = ['a', 'b', 'c'];
      deviceDelegate.onMediaDevicesChanged(
        createDevicesChangeInfo(deviceIds, { added: ['c'] }),
        createDevicesChangeInfo(deviceIds, { added: ['a'] }),
      );
      expect(deviceDelegate['_speakerConfigManager'].setDevice).toBeCalledWith({
        source: SOURCE_TYPE.NEW_DEVICE,
        deviceId: 'c',
      });
      expect(
        deviceDelegate['_microphoneConfigManager'].setDevice,
      ).toBeCalledWith({
        source: SOURCE_TYPE.NEW_DEVICE,
        deviceId: 'a',
      });
    });

    it('should re ensure device', () => {
      const deviceIds = ['a', 'b', 'c'];
      jest.spyOn(deviceDelegate['_speakerConfigManager'], 'ensureDevice');
      jest.spyOn(deviceDelegate['_microphoneConfigManager'], 'ensureDevice');
      deviceDelegate.onMediaDevicesChanged(
        createDevicesChangeInfo(deviceIds, { deleted: ['d'] }),
        createDevicesChangeInfo(deviceIds, { deleted: ['e'] }),
      );
      expect(deviceDelegate['_speakerConfigManager'].ensureDevice).toBeCalled();
      expect(
        deviceDelegate['_microphoneConfigManager'].ensureDevice,
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
      deviceDelegate['_speakerConfigManager'].setDevice({
        deviceId: 'a',
      } as any);
      expect(mockRtcEngine.setCurrentAudioOutput).toBeCalledWith('a');
      expect(mockUserConfig.setCurrentSpeaker).toBeCalledWith('a');
    });
    it('should create DeviceSyncManager correctly', () => {
      deviceDelegate['_microphoneConfigManager'].setDevice({
        deviceId: 'a',
      } as any);
      expect(mockRtcEngine.setCurrentAudioInput).toBeCalledWith('a');
      expect(mockUserConfig.setCurrentMicrophone).toBeCalledWith('a');
    });
  });
});
