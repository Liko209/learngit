/*
 * @Author: Paynter Chen
 * @Date: 2019-05-31 08:18:39
 * Copyright © RingCentral. All rights reserved.
 */

enum SOURCE_TYPE {
  EMPTY,
  STORAGE,
  LAST_USED,
  NEW_DEVICE,
  DEFAULT,
}

interface IStorage {
  get(): string;
  set(value: string): void;
}

interface IDeviceManager {
  getDevices(): MediaDeviceInfo[];
  setDeviceId(id: string): void;
  getDeviceId(): string;
  getDefaultDeviceId(): string;
}

interface ILastUsedDeviceManager {
  record(deviceId: string): void;
  getLastAvailableUsedDevice(devices: MediaDeviceInfo[]): string | undefined;
}

export { SOURCE_TYPE, IStorage, IDeviceManager, ILastUsedDeviceManager };
