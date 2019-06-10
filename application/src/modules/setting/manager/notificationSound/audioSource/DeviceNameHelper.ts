/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-04 20:51:12
 * Copyright © RingCentral. All rights reserved.
 */
import i18next from '@/i18n';
const UNKNOWN = 'Unknown';

class DeviceNameHelper {
  static getDeviceName(
    device: MediaDeviceInfo,
    allDevices: MediaDeviceInfo[],
    t: i18next.TFunction,
  ) {
    let result = '';

    if (this._isDefaultDevice(device)) {
      result = this._getDefaultDeviceName(t);
    } else if (this._isNoDevice(device)) {
      result = this._getNoDeviceName(t);
    } else if (device.label) {
      if (this._isBuiltInDevice(device)) {
        result = this._getBuiltInDeviceName(device, t);
      } else {
        result = device.label;
      }
    } else {
      result = this._getOrderedDeviceName(device, allDevices, t);
    }

    return result;
  }

  private static _isDefaultDevice(device: MediaDeviceInfo) {
    return device.deviceId === 'default' || /default/gi.test(device.label);
  }

  private static _isNoDevice(device: MediaDeviceInfo) {
    return device.deviceId === '';
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
    text = `${text} #${order}`;
    return text;
  }
}

export { DeviceNameHelper };
