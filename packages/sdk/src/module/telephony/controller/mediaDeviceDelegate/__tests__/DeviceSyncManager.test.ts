/*
 * @Author: Paynter Chen
 * @Date: 2019-05-26 21:42:27
 * Copyright © RingCentral. All rights reserved.
 */
import { IStorage, IDeviceManager, SOURCE_TYPE } from '../types';
import { LastUsedDeviceManager } from '../LastUsedDeviceManager';
import { DeviceSyncManger } from '../DeviceSyncManger';
import { spyOnTarget } from 'sdk/__tests__/utils';
import { defaultAudioID } from 'voip/src/account/constants';

describe('DeviceSyncManger', () => {
  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }

  let mockStorage: IStorage;
  let mockLatUsedDeviceManager: LastUsedDeviceManager;
  let mockDeviceManager: IDeviceManager;
  let mockDefaultDeviceId = 'DEFAULT_DEVICE_ID';
  let mockDevices = [{ deviceId: 'a' }, { deviceId: 'b' }];

  let deviceSyncManager: DeviceSyncManger;
  function setUp() {
    let store: string;
    mockStorage = {
      get: jest.fn().mockImplementation(() => store),
      set: jest.fn().mockImplementation((data: string) => {
        store = data;
      }),
      on: jest.fn().mockImplementation((data: string) => {
        return jest.fn();
      }),
    };
    let deviceId: string;
    mockDeviceManager = {
      getDefaultDeviceId: jest.fn().mockReturnValue(mockDefaultDeviceId),
      getDeviceId: jest.fn().mockImplementation(() => deviceId),
      setDeviceId: jest.fn().mockImplementation((value: string) => {
        deviceId = value;
      }),
      getDevices: jest.fn().mockReturnValue(mockDevices),
      on: jest.fn().mockImplementation((data: string) => {
        return jest.fn();
      }),
    };

    mockLatUsedDeviceManager = {
      record: jest.fn(),
      getLastAvailableUsedDevice: jest.fn(),
    } as any;
    deviceSyncManager = new DeviceSyncManger(
      mockStorage,
      mockDeviceManager,
      mockLatUsedDeviceManager,
    );
  }

  function cleanUp() {
    clearMocks();
  }

  describe('subscribe()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should subscribe and handle two way change', () => {
      deviceSyncManager.startSync();
      expect(mockStorage.on).toBeCalled();
      expect(mockDeviceManager.on).toBeCalled();
      deviceSyncManager.endSync();
    });
  });

  describe('handle DeviceManager value change', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should set to storage when deviceManager value changed', () => {
      jest.spyOn(deviceSyncManager, 'setDevice');
      mockStorage.get.mockReturnValue('bb');
      deviceSyncManager['_handleDeviceManagerChanged']('aa');
      expect(deviceSyncManager.setDevice).toBeCalledWith({
        source: SOURCE_TYPE.DEVICE_MANAGER,
        deviceId: 'aa',
      });
      expect(mockStorage.set).toBeCalledWith('aa');
    });
    it('should not set to storage when deviceManager value changed but equal to storage value', () => {
      jest.spyOn(deviceSyncManager, 'setDevice');
      mockStorage.get.mockReturnValue('aa');
      deviceSyncManager['_handleDeviceManagerChanged']('aa');
      expect(deviceSyncManager.setDevice).not.toBeCalled();
      expect(mockStorage.set).not.toBeCalled();
    });
  });

  describe('handle storage value change', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should set to DeviceManager when storage value changed', () => {
      jest.spyOn(deviceSyncManager, 'setDevice');
      mockDeviceManager.getDeviceId.mockReturnValue('bb');
      deviceSyncManager['_handleStorageChanged']('aa');
      expect(deviceSyncManager.setDevice).toBeCalledWith({
        source: SOURCE_TYPE.STORAGE,
        deviceId: 'aa',
      });
      expect(mockDeviceManager.setDeviceId).toBeCalledWith('aa');
    });
    it('should not set to DeviceManager when storage value changed but equal to DeviceManager value', () => {
      jest.spyOn(deviceSyncManager, 'setDevice');
      mockDeviceManager.getDeviceId.mockReturnValue('aa');
      deviceSyncManager['_handleStorageChanged']('aa');
      expect(deviceSyncManager.setDevice).not.toBeCalled();
      expect(mockDeviceManager.setDeviceId).not.toBeCalled();
    });
  });

  describe('setDevice()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });

    it('should not save when device is empty', () => {
      deviceSyncManager.setDevice({
        source: SOURCE_TYPE.EMPTY,
        deviceId: 'xxx',
      });
      expect(mockStorage.set).not.toBeCalled();
      expect(mockDeviceManager.setDeviceId).not.toBeCalled();
    });
    it('should not save when device is empty', () => {
      deviceSyncManager.setDevice({
        source: SOURCE_TYPE.NEW_DEVICE,
        deviceId: '',
      });
      expect(mockStorage.set).not.toBeCalled();
      expect(mockDeviceManager.setDeviceId).not.toBeCalled();
    });
    it('should not save to storage again when deviceId not change', () => {
      expect(mockStorage.set).not.toBeCalled();
      mockStorage.get.mockReturnValue('AAA');
      mockDeviceManager.getDeviceId.mockReturnValue('BBB');
      deviceSyncManager.setDevice({
        source: SOURCE_TYPE.STORAGE,
        deviceId: 'AAA',
      });
      expect(mockStorage.set).not.toBeCalled();
      expect(mockDeviceManager.setDeviceId).toBeCalled();
    });
    it('should not set to deviceManager again when deviceId not change', () => {
      mockStorage.get.mockReturnValue('BBB');
      mockDeviceManager.getDeviceId.mockReturnValue('AAA');
      deviceSyncManager.setDevice({
        source: SOURCE_TYPE.STORAGE,
        deviceId: 'AAA',
      });
      expect(mockStorage.set).toBeCalled();
      expect(mockDeviceManager.setDeviceId).not.toBeCalled();
    });
    it('should update deviceId when deviceId change', () => {
      mockStorage.get.mockReturnValue('BBB');
      mockDeviceManager.getDeviceId.mockReturnValue('BBB');
      deviceSyncManager.setDevice({
        source: SOURCE_TYPE.STORAGE,
        deviceId: 'AAA',
      });
      expect(mockStorage.set).toBeCalled();
      expect(mockDeviceManager.setDeviceId).toBeCalled();
    });
  });
  describe('ensureDevice()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });

    it('', () => {});
    it('should use EMPTY when devices is empty', () => {
      mockDeviceManager.getDevices.mockReturnValue([]);
      expect(deviceSyncManager['_ensureDevice']()).toEqual({
        source: SOURCE_TYPE.EMPTY,
        deviceId: '',
      });
    });
    it('should use storage when storage device available(exist && in devices) [JPT-2113]', () => {
      mockDeviceManager.getDevices.mockReturnValue([
        {
          deviceId: 'AAA',
        },
      ]);
      mockStorage.get.mockReturnValue('AAA');
      expect(deviceSyncManager['_ensureDevice']()).toEqual({
        source: SOURCE_TYPE.STORAGE,
        deviceId: 'AAA',
      });
      expect(mockStorage.get).toBeCalled();
    });
    it('should use lastUsed when storage devices not available(not exist)', () => {
      mockDeviceManager.getDevices.mockReturnValue([
        {
          deviceId: 'AAA',
        },
      ]);
      mockStorage.get.mockReturnValue(undefined);
      mockLatUsedDeviceManager.getLastAvailableUsedDevice.mockReturnValue(
        'AAA',
      );
      expect(deviceSyncManager['_ensureDevice']()).toEqual({
        source: SOURCE_TYPE.LAST_USED,
        deviceId: 'AAA',
      });
      expect(mockLatUsedDeviceManager.getLastAvailableUsedDevice).toBeCalled();
    });
    it('should use lastUsed when storage devices not available(not in devices). [JPT-2266]', () => {
      mockDeviceManager.getDevices.mockReturnValue([
        {
          deviceId: 'AAA',
        },
      ]);
      mockStorage.get.mockReturnValue('BBB');
      mockLatUsedDeviceManager.getLastAvailableUsedDevice.mockReturnValue(
        'AAA',
      );
      expect(deviceSyncManager['_ensureDevice']()).toEqual({
        source: SOURCE_TYPE.LAST_USED,
        deviceId: 'AAA',
      });
      expect(mockLatUsedDeviceManager.getLastAvailableUsedDevice).toBeCalled();
    });
    // should save current device id = 'default' when real device id not found. [JPT-1731]
    it('should use current device(deviceManager) when (storage device, lastUsed device) not available.', () => {
      mockDeviceManager.getDevices.mockReturnValue([
        {
          deviceId: 'AAA',
        },
      ]);
      mockDeviceManager.getDeviceId.mockReturnValue('AAA');
      mockStorage.get.mockReturnValue('BBB');
      mockLatUsedDeviceManager.getLastAvailableUsedDevice.mockReturnValue(
        undefined,
      );

      expect(deviceSyncManager['_ensureDevice']()).toEqual({
        source: SOURCE_TYPE.DEVICE_MANAGER,
        deviceId: 'AAA',
      });
      expect(mockDeviceManager.getDeviceId).toBeCalled();
      expect(mockDeviceManager.getDefaultDeviceId).not.toBeCalled();
    });
    it('should use default device(deviceManager) when (storage device, lastUsed device) not available. [JPT-2267]', () => {
      mockDeviceManager.getDevices.mockReturnValue([
        {
          deviceId: 'AAA',
        },
      ]);
      mockStorage.get.mockReturnValue('BBB');
      mockDeviceManager.getDeviceId.mockReturnValue('BBB');
      mockLatUsedDeviceManager.getLastAvailableUsedDevice.mockReturnValue(
        undefined,
      );
      expect(deviceSyncManager['_ensureDevice']()).toEqual({
        source: SOURCE_TYPE.DEFAULT,
        deviceId: mockDefaultDeviceId,
      });
      expect(mockDeviceManager.getDeviceId).toBeCalled();
      expect(mockDeviceManager.getDefaultDeviceId).toBeCalled();
    });
  });
});
