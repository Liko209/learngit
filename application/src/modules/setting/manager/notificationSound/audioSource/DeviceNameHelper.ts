/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-04 20:51:12
 * Copyright © RingCentral. All rights reserved.
 */
import i18next from '@/i18n';
import { NO_DEVICES_ID } from './constant';
const UNKNOWN = 'Unknown';
class DeviceNameHelper {
  static getDeviceName(
    device: MediaDeviceInfo,
    allDevices: MediaDeviceInfo[],
    t: i18next.TFunction,
  ) {
    let text = '';

    if (this._isDefaultDevice(device)) {
      text = this._getDefaultDeviceName(t);
    } else if (this._isNoDevice(device)) {
      text = this._getNoDeviceName(t);
    } else if (device.label) {
      if (this._isBuiltInDevice(device)) {
        text = this._getBuiltInDeviceName(device, t);
      } else {
        text = device.label;
      }
    } else {
      text = this._getOrderedDeviceName(device, allDevices, t);
    }

    return text;
  }

  private static _isDefaultDevice(device: MediaDeviceInfo) {
    return device.deviceId === 'default' || /default/gi.test(device.label);
  }

  private static _isNoDevice(device: MediaDeviceInfo) {
    return device.deviceId === NO_DEVICES_ID;
  }

  private static _isBuiltInDevice(device: MediaDeviceInfo) {
    return /(built-in|internal)/gi.test(device.label);
  }

  private static _getDefaultDeviceName(t: i18next.TFunction) {
    return t('setting.default');
  }

  private static _getNoDeviceName(t: i18next.TFunction) {
    return t('setting.noDevices');
  }

  private static _getBuiltInDeviceName(
    device: MediaDeviceInfo,
    t: i18next.TFunction,
  ) {
    const MAP = {
      audioinput: t('setting.builtInMicrophone'),
      audiooutput: t('setting.builtInSpeaker'),
    };
    return MAP[device.kind] || UNKNOWN;
  }

  private static _getOrderedDeviceName(
    device: MediaDeviceInfo,
    allDevices: MediaDeviceInfo[],
    t: i18next.TFunction,
  ) {
    let text = '';
    const index = allDevices
      .filter(device => !this._isDefaultDevice(device))
      .findIndex(sourceItem => sourceItem.deviceId === device.deviceId);
    const order = index + 1;
    const MAP = {
      audioinput: t('setting.microphone'),
      audiooutput: t('setting.speaker'),
    };
    text = MAP[device.kind] || UNKNOWN;
    text = `${text} ${order}`;
    return text;
  }
}

export { DeviceNameHelper };
