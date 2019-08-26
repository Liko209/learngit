/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-04 20:51:12
 * Copyright © RingCentral. All rights reserved.
 */
const UNKNOWN = 'Unknown';

class DeviceNameHelper {
  static getDeviceName(
    device: MediaDeviceInfo,
    allDevices: MediaDeviceInfo[],
    t: Function,
  ) {
    let result = '';
    if (this._isDeviceAll(device)) {
      result = this._getDeviceAll(t);
    } else if (this._isDeviceOff(device)) {
      result = this._getDeviceOff(t);
    } else if (this._isDefaultDevice(device)) {
      result = this._getDefaultDeviceName(t);
    } else if (this._isNoDevice(device)) {
      result = this._getNoDeviceName(t);
    } else if (device.label) {
      result = device.label;
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

  private static _isDeviceAll(device: MediaDeviceInfo) {
    return device.deviceId === 'all';
  }

  private static _isDeviceOff(device: MediaDeviceInfo) {
    return device.deviceId === 'off';
  }

  private static _getDefaultDeviceName(t: Function) {
    return t('setting.useDefault');
  }

  private static _getNoDeviceName(t: Function) {
    return t('setting.noDevices');
  }

  private static _getDeviceAll(t: Function) {
    return t('setting.allDevices');
  }

  private static _getDeviceOff(t: Function) {
    return t('setting.off');
  }

  private static _getOrderedDeviceName(
    device: MediaDeviceInfo,
    allDevices: MediaDeviceInfo[],
    t: Function,
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
