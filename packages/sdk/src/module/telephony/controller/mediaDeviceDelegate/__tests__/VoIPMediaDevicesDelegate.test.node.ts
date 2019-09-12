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
import { RINGER_ADDITIONAL_TYPE } from 'sdk/module/telephony/types';
import { DeviceSyncManger } from '../DeviceSyncManger';

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
  let mockPermissionStatus: any;
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

    mockPermissionStatus = {
      state: 'prompt',
      addEventListener: jest.fn(),
    }
    global.navigator = {
      permissions: {
        query: jest.fn().mockResolvedValue(mockPermissionStatus)
      }
    }
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
      deviceDelegate = new VoIPMediaDevicesDelegate(mockRtcEngine);
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
      deviceDelegate = new VoIPMediaDevicesDelegate(mockRtcEngine);
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
      deviceDelegate = new VoIPMediaDevicesDelegate(mockRtcEngine);
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
      deviceDelegate = new VoIPMediaDevicesDelegate(mockRtcEngine);
    });

    afterEach(() => {
      cleanUp();
    });

    it('should call onMediaDevicesInitialed', () => {
      jest.clearAllMocks();
      jest.spyOn(deviceDelegate, '_initDevicesState');
      deviceDelegate.onMediaDevicesInitialed();
      expect(deviceDelegate['_initDevicesState']).toBeCalled();
      expect(notificationCenter.emit).toHaveBeenCalledWith(RTC_MEDIA_ACTION.INPUT_DEVICE_LIST_CHANGED, expect.arrayContaining([]));
      expect(notificationCenter.emit).toHaveBeenCalledWith(RTC_MEDIA_ACTION.OUTPUT_DEVICE_LIST_CHANGED, expect.arrayContaining([]));
    });
  });

  describe('DeviceSyncManager', () => {
    beforeEach(() => {
      setUp();
      deviceDelegate = new VoIPMediaDevicesDelegate(mockRtcEngine);
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
    beforeEach(() => {
      setUp();
      deviceDelegate = new VoIPMediaDevicesDelegate(mockRtcEngine);
    });

    afterEach(() => {
      cleanUp();
    });
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

  describe('_extractBluetoothInfo()', () => {
    beforeEach(() => {
      setUp();
      deviceDelegate = new VoIPMediaDevicesDelegate(mockRtcEngine);
      
    });
    
    afterEach(() => {
      cleanUp();
    });
    it('should extract bluetooth info', () => {
      expect(deviceDelegate['_extractBluetoothInfo']('Headset (AirSolo Hands-Free) (Bluetooth)')).toEqual({
        deviceName: 'AirSolo',
        bluetoothMode: 'Hands-Free'
      });
      expect(deviceDelegate['_extractBluetoothInfo']('Headset (AirSolo Stereo) (Bluetooth)')).toEqual({
        deviceName: 'AirSolo',
        bluetoothMode: 'Stereo'
      });
    });
    it('should extract null when not bluetooth name', () => {
      expect(deviceDelegate['_extractBluetoothInfo']('Headset (AirSolo)')).toEqual(null);
    });
    it('should extract null when not bluetooth name', () => {
      expect(deviceDelegate['_extractBluetoothInfo']('')).toEqual(null);
    });
    
  });
  describe('_switchStereoToHandsFreeIfNeed()', () => {
    let mockDevices: any;
    let setDeviceId: any;
    beforeEach(() => {
      setUp();
      
      mockDevices = [
        {
          deviceId: '1',
          label: 'Headset (AirSolo Hands-Free) (Bluetooth)',
          groupId: 'x',
          kind: 'audiooutput',
        } as any,
        {
          deviceId: '2',
          label: 'Headset (AirSolo Stereo) (Bluetooth)',
          groupId: 'x',
          kind: 'audiooutput',
        }as any,
        {
          deviceId: '3',
          label: 'Headset (AirSolo2 Hands-Free) (Bluetooth)',
          groupId: 'x',
          kind: 'audiooutput',
        } as any,
        {
          deviceId: '4',
          label: 'Headset (AirSolo2 Stereo) (Bluetooth)',
          groupId: 'x',
          kind: 'audiooutput',
        }as any,
        {
          deviceId: '5',
          label: 'Headset (AirSolo3)',
          groupId: 'x',
          kind: 'audiooutput',
        }as any,
      ]
      setDeviceId = jest.fn();
    });
    
    afterEach(() => {
      cleanUp();
    });
    it('should switch to hands-free device', () => {
      deviceDelegate = new VoIPMediaDevicesDelegate(mockRtcEngine);
      jest.clearAllMocks();
      deviceDelegate['_switchStereoToHandsFreeIfNeed'](mockDevices, '2', setDeviceId);
      expect(setDeviceId).toHaveBeenCalledWith('1');
    });
    it('should switch to hands-free device', () => {
      deviceDelegate = new VoIPMediaDevicesDelegate(mockRtcEngine);
      jest.clearAllMocks();
      deviceDelegate['_switchStereoToHandsFreeIfNeed'](mockDevices, '4', setDeviceId);
      expect(setDeviceId).toHaveBeenCalledWith('3');
    });
    it('should do nothing when currently is hands-free', () => {
      deviceDelegate = new VoIPMediaDevicesDelegate(mockRtcEngine);
      jest.clearAllMocks();
      deviceDelegate['_switchStereoToHandsFreeIfNeed'](mockDevices, '1', setDeviceId);
      expect(setDeviceId).not.toHaveBeenCalled();
    });
    it('should do nothing when currently is not bluetooth device', () => {
      deviceDelegate = new VoIPMediaDevicesDelegate(mockRtcEngine);
      jest.clearAllMocks();
      deviceDelegate['_switchStereoToHandsFreeIfNeed'](mockDevices, '5', setDeviceId);
      expect(setDeviceId).not.toHaveBeenCalled();
    });
    
  });
  describe('_handlerDeviceChange()', () => {
    beforeEach(() => {
      setUp();
    })
    afterEach(() => {
      cleanUp();
    });
    it('should ensureDevice when device deleted', () => {
      
      deviceDelegate = new VoIPMediaDevicesDelegate(mockRtcEngine);
      const mockSyncManager = {
        ensureDevice: jest.fn(),
        setDevice: jest.fn(),
      } as any as DeviceSyncManger;
      deviceDelegate['_handlerDeviceChange'](mockSyncManager, [], {
          hashChanged: true,
          added: [],
          deleted: [
            {
              deviceId: '1',
              label: 'Headset (AirSolo Hands-Free) (Bluetooth)',
              groupId: 'x',
              kind: 'audiooutput',
            } as any
          ]
      })
      expect(mockSyncManager.ensureDevice).toBeCalledTimes(1);
    });
    it('should setDevice when normal device added', () => {
      
      deviceDelegate = new VoIPMediaDevicesDelegate(mockRtcEngine);
      const mockSyncManager = {
        ensureDevice: jest.fn(),
        setDevice: jest.fn(),
      } as any as DeviceSyncManger;
      deviceDelegate['_handlerDeviceChange'](mockSyncManager, [], {
          hashChanged: true,
          deleted: [],
          added: [
            {
              deviceId: '1',
              label: 'Jabra SPEAK 510 USB (0b0e:0422)',
              groupId: 'x',
              kind: 'audiooutput',
            } as any
          ]
      })
      expect(mockSyncManager.setDevice).toBeCalledTimes(1);
      expect(mockSyncManager.setDevice).toHaveBeenCalledWith({
        deviceId: '1',
        source: SOURCE_TYPE.NEW_DEVICE,
      });
    
    });
    it('should setDevice when bluetooth added', () => {
      
      deviceDelegate = new VoIPMediaDevicesDelegate(mockRtcEngine);
      const mockSyncManager = {
        ensureDevice: jest.fn(),
        setDevice: jest.fn(),
      } as any as DeviceSyncManger;
      deviceDelegate['_handlerDeviceChange'](mockSyncManager, [], {
          hashChanged: true,
          deleted: [],
          added: [
            {
              deviceId: '1',
              label: 'Headset (AirSolo Stereo) (Bluetooth)',
              groupId: 'x',
              kind: 'audiooutput',
            } as any,
            {
              deviceId: '2',
              label: 'Headset (AirSolo Hands-Free) (Bluetooth)',
              groupId: 'x',
              kind: 'audiooutput',
            } as any
          ]
      })
      expect(mockSyncManager.setDevice).toBeCalledTimes(1);
      expect(mockSyncManager.setDevice).toHaveBeenCalledWith({
        deviceId: '2',
        source: SOURCE_TYPE.NEW_DEVICE,
      });
    
    });
    
  });
  
});
