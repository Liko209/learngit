import { IStorage, IDeviceManager, SOURCE_TYPE } from '../types';
import { LastUsedDeviceManager } from '../LastUsedDeviceManager';
import { DeviceSyncManger } from '../DeviceSyncManger';
import { spyOnTarget } from 'sdk/__tests__/utils';

/*
 * @Author: Paynter Chen
 * @Date: 2019-05-26 21:42:27
 * Copyright © RingCentral. All rights reserved.
 */

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
    };
    let deviceId: string;
    mockDeviceManager = {
      getDefaultDeviceId: jest.fn().mockReturnValue(mockDefaultDeviceId),
      getDeviceId: jest.fn().mockImplementation(() => deviceId),
      setDeviceId: jest.fn().mockImplementation((value: string) => {
        deviceId = value;
      }),
      getDevices: jest.fn().mockReturnValue(mockDevices),
    };

    mockLatUsedDeviceManager = spyOnTarget(
      new LastUsedDeviceManager(mockStorage),
    );
    deviceSyncManager = new DeviceSyncManger(
      mockStorage,
      mockDeviceManager,
      mockLatUsedDeviceManager,
    );
  }

  function cleanUp() {
    clearMocks();
  }

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
    it('should use storage when storage device available(exist && in devices)', () => {
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
    it('should use lastUsed when storage devices not available(not in devices)', () => {
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
    it('should use default device when (storage device, lastUsed device) not available', () => {
      mockDeviceManager.getDevices.mockReturnValue([
        {
          deviceId: 'AAA',
        },
      ]);
      mockStorage.get.mockReturnValue('BBB');
      mockLatUsedDeviceManager.getLastAvailableUsedDevice.mockReturnValue(
        undefined,
      );
      expect(deviceSyncManager['_ensureDevice']()).toEqual({
        source: SOURCE_TYPE.DEFAULT,
        deviceId: mockDefaultDeviceId,
      });
      expect(mockDeviceManager.getDefaultDeviceId).toBeCalled();
    });
  });
});
