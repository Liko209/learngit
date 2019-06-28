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
  DEVICE_MANAGER,
  DEFAULT,
}

enum RINGER_ADDITIONAL_TYPE {
  ALL = 'all',
  OFF = 'off',
}

type Disposer = () => void;

type Subscriber = (handleChanged: (newValue: string) => void) => Disposer;

interface IStorage {
  get(): string;
  set(value: string): void;
  on?: Subscriber;
}

interface IDeviceManager {
  getDevices(): MediaDeviceInfo[];
  setDeviceId(id: string): void;
  getDeviceId(): string;
  getDefaultDeviceId(devices: MediaDeviceInfo[]): string;
  on?: Subscriber;
}

interface ILastUsedDeviceManager {
  record(deviceId: string): void;
  getLastAvailableUsedDevice(devices: MediaDeviceInfo[]): string | undefined;
}

export {
  SOURCE_TYPE,
  RINGER_ADDITIONAL_TYPE,
  IStorage,
  IDeviceManager,
  ILastUsedDeviceManager,
  Disposer,
};
