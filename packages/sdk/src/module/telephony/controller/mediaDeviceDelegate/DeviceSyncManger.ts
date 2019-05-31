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
} from './types';
const LOG_TAG = '[DeviceSyncManger]';

export class DeviceSyncManger {
  constructor(
    private _storage: IStorage,
    private _deviceManager: IDeviceManager,
    private _lastUsedDeviceManager: ILastUsedDeviceManager,
  ) {}

  private _ensureDevice = (): { source: SOURCE_TYPE; deviceId: string } => {
    const EMPTY_ID = 'EMPTY_ID';
    const devices = this._deviceManager.getDevices();
    if (!devices.length) {
      return {
        source: SOURCE_TYPE.EMPTY,
        deviceId: EMPTY_ID,
      };
    }
    const storageDeviceId = this._storage.get();
    if (devices.find(device => device.deviceId === storageDeviceId)) {
      return {
        source: SOURCE_TYPE.STORAGE,
        deviceId: storageDeviceId,
      };
    }
    const lastUsedDeviceId = this._lastUsedDeviceManager.getLastAvailableUsedDevice(
      devices,
    );
    if (lastUsedDeviceId) {
      return {
        source: SOURCE_TYPE.LAST_USED,
        deviceId: lastUsedDeviceId,
      };
    }
    const defaultDeviceId = this._deviceManager.getDefaultDeviceId();
    return {
      source: SOURCE_TYPE.DEFAULT,
      deviceId: defaultDeviceId,
    };
  }

  setDevice(info: { source: SOURCE_TYPE; deviceId: string }) {
    const { source, deviceId } = info;
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
      this._lastUsedDeviceManager.record(deviceId);
      this._storage.set(deviceId);
    }
  }

  ensureDevice() {
    this.setDevice(this._ensureDevice());
  }
}
