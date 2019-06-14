/*
 * @Author: Paynter Chen
 * @Date: 2019-05-31 08:18:39
 * Copyright © RingCentral. All rights reserved.
 */

import { telephonyLogger } from 'foundation';
import _ from 'lodash';
import {
  IDeviceManager,
  ILastUsedDeviceManager,
  SOURCE_TYPE,
  IStorage,
  Disposer,
} from './types';
const LOG_TAG = '[DeviceSyncManger]';

export class DeviceSyncManger {
  private _disposers: Disposer[] = [];
  constructor(
    private _storage: IStorage,
    private _deviceManager: IDeviceManager,
    private _lastUsedDeviceManager: ILastUsedDeviceManager,
  ) {}

  startSync() {
    this._storage.on &&
      this._disposers.push(this._storage.on(this._handleStorageChanged));
    this._deviceManager.on &&
      this._disposers.push(
        this._deviceManager.on(this._handleDeviceManagerChanged),
      );
  }

  endSync() {
    this._disposers.forEach(disposer => disposer());
  }

  private _handleStorageChanged = (newValue: string) => {
    if (this._deviceManager.getDeviceId() !== newValue) {
      telephonyLogger
        .tags(LOG_TAG)
        .debug('apply Storage value changed:', newValue);
      this.setDevice({
        source: SOURCE_TYPE.STORAGE,
        deviceId: newValue,
      });
    }
  }

  private _handleDeviceManagerChanged = (newValue: string) => {
    if (this._storage.get() !== newValue) {
      telephonyLogger
        .tags(LOG_TAG)
        .debug('apply DeviceManager value changed:', newValue);
      this.setDevice({
        source: SOURCE_TYPE.DEVICE_MANAGER,
        deviceId: newValue,
      });
    }
  }

  private _ensureDevice = (): { source: SOURCE_TYPE; deviceId: string } => {
    const devices = this._deviceManager.getDevices();
    if (!devices.length) {
      telephonyLogger.tags(LOG_TAG).debug('devices is empty');
      return {
        source: SOURCE_TYPE.EMPTY,
        deviceId: '',
      };
    }
    const storageDeviceId = this._storage.get();
    if (devices.find(device => device.deviceId === storageDeviceId)) {
      telephonyLogger
        .tags(LOG_TAG)
        .debug('find available deviceId in storage:', storageDeviceId);
      return {
        source: SOURCE_TYPE.STORAGE,
        deviceId: storageDeviceId,
      };
    }
    const lastUsedDeviceId = this._lastUsedDeviceManager.getLastAvailableUsedDevice(
      devices,
    );
    if (lastUsedDeviceId) {
      telephonyLogger
        .tags(LOG_TAG)
        .debug('find available deviceId in lastUsedDevices:', lastUsedDeviceId);
      return {
        source: SOURCE_TYPE.LAST_USED,
        deviceId: lastUsedDeviceId,
      };
    }
    const currentDeviceId = this._deviceManager.getDeviceId();
    if (devices.find(device => device.deviceId === currentDeviceId)) {
      return {
        source: SOURCE_TYPE.DEVICE_MANAGER,
        deviceId: currentDeviceId,
      };
    }
    const defaultDeviceId = this._deviceManager.getDefaultDeviceId(devices);
    telephonyLogger
      .tags(LOG_TAG)
      .debug('use default device id:', defaultDeviceId);
    return {
      source: SOURCE_TYPE.DEFAULT,
      deviceId: defaultDeviceId,
    };
  }

  setDevice(info: { source: SOURCE_TYPE; deviceId: string }) {
    const { source, deviceId } = info;
    if (source === SOURCE_TYPE.EMPTY || _.isEmpty(deviceId)) {
      telephonyLogger
        .tags(LOG_TAG)
        .info('setDevice as empty', { source, deviceId });
      return;
    }
    const device = this._deviceManager
      .getDevices()
      .find(device => device.deviceId === deviceId);
    if (deviceId !== this._deviceManager.getDeviceId()) {
      telephonyLogger
        .tags(LOG_TAG)
        .info('setDevice to deviceManager', { source, deviceId, device });
      this._deviceManager.setDeviceId(deviceId);
    }
    if (deviceId !== this._storage.get()) {
      telephonyLogger
        .tags(LOG_TAG)
        .info('setDevice to storage', { source, deviceId, device });
      this._storage.set(deviceId);
    }
    this._lastUsedDeviceManager.record(deviceId);
  }

  ensureDevice() {
    this.setDevice(this._ensureDevice());
  }
}
