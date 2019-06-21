import { IStorage } from '../types';
import { LastUsedDeviceManager } from '../LastUsedDeviceManager';

/*
 * @Author: Paynter Chen
 * @Date: 2019-05-26 21:42:27
 * Copyright © RingCentral. All rights reserved.
 */

describe('LastUsedDeviceManager', () => {
  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }

  let mockStorage: IStorage;
  let lastUsedDeviceManager: LastUsedDeviceManager;

  function setUp() {
    let store: string;
    mockStorage = {
      get: jest.fn().mockImplementation(() => store),
      set: jest.fn().mockImplementation((data: string) => {
        store = data;
      }),
    };
    lastUsedDeviceManager = new LastUsedDeviceManager(mockStorage);
  }

  function cleanUp() {
    clearMocks();
  }

  describe('record()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });

    it('should record to storage join ,', () => {
      lastUsedDeviceManager.record('A');
      expect(mockStorage.set).toBeCalledWith('A');
      lastUsedDeviceManager.record('B');
      expect(mockStorage.set).toBeCalledWith('A,B');
    });
    it('should move old record to new place', () => {
      lastUsedDeviceManager.record('A');
      lastUsedDeviceManager.record('B');
      lastUsedDeviceManager.record('A');
      expect(mockStorage.set).toBeCalledWith('B,A');
    });
    it('should remove record > maxSize', () => {
      const MAX_DEVICE_HISTORY_SIZE = 5;
      for (let index = 1; index < MAX_DEVICE_HISTORY_SIZE + 1; index++) {
        lastUsedDeviceManager.record(`${index}`);
      }
      expect(mockStorage.set).toHaveBeenLastCalledWith('1,2,3,4,5');
      lastUsedDeviceManager.record('6');
      expect(mockStorage.set).toHaveBeenLastCalledWith('2,3,4,5,6');
    });
  });

  describe('getLastAvailableUsedDevice()', () => {
    beforeEach(() => {
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });

    it('should get available device in record history', () => {
      mockStorage.get.mockReturnValue('1,2,3,4,5');
      const deviceId = lastUsedDeviceManager.getLastAvailableUsedDevice([
        {
          deviceId: '2',
        },
      ] as any);
      expect(deviceId).toEqual('2');
    });
    it('should return undefined when not available device found', () => {
      mockStorage.get.mockReturnValue('1,3,4,5');
      const deviceId = lastUsedDeviceManager.getLastAvailableUsedDevice([
        {
          deviceId: '2',
        },
      ] as any);
      expect(deviceId).toBeUndefined();
    });
  });
});
