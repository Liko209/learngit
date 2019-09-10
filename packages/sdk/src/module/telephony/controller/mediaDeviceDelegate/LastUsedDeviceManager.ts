/*
 * @Author: Paynter Chen
 * @Date: 2019-05-31 08:18:39
 * Copyright © RingCentral. All rights reserved.
 */

import { telephonyLogger } from 'foundation/log';
import _ from 'lodash';
import { ILastUsedDeviceManager, IStorage } from './types';

const MAX_DEVICE_HISTORY_SIZE = 5;

export class LastUsedDeviceManager implements ILastUsedDeviceManager {
  constructor(private _storage: IStorage) {}

  private _getHistories(): string[] {
    const historyString = this._storage.get();
    let histories: string[] = [];
    if (historyString) {
      try {
        histories = historyString.split(',');
      } catch {
        telephonyLogger.warn('parse storage value fail:', historyString);
      }
    }
    return histories;
  }

  record(deviceId: string): void {
    const histories = this._getHistories().filter(id => deviceId !== id);
    histories.push(deviceId);
    if (histories.length > MAX_DEVICE_HISTORY_SIZE) {
      histories.splice(0, histories.length - MAX_DEVICE_HISTORY_SIZE);
    }
    this._storage.set(histories.join(','));
  }

  getLastAvailableUsedDevice(devices: MediaDeviceInfo[]): string | undefined {
    const devicesSet = new Set(devices.map(device => device.deviceId));
    const lastUseDeviceId = _.findLast(
      this._getHistories(),
      (deviceId: string) => devicesSet.has(deviceId),
    );
    return lastUseDeviceId;
  }
}
