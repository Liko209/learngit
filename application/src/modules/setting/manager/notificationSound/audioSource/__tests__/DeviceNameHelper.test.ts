/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-04 21:04:31
 * Copyright © RingCentral. All rights reserved.
 */
import { DeviceNameHelper } from '../DeviceNameHelper';
import { NO_DEVICES_ID } from '../constant';

const DEVICE_1 = 'DEVICE_1';
const DEVICE_2 = 'DEVICE_2';

const fakeT = (str: any) => str;

describe('DeviceNameHelper', () => {
  describe('getDeviceName()', () => {
    it('should return setting.builtInMicrophone for a built-in audio input device', () => {
      const device: MediaDeviceInfo = {
        deviceId: DEVICE_1,
        groupId: '0',
        label: 'Microphone (built-in)',
        kind: 'audioinput',
      };
      const result = DeviceNameHelper.getDeviceName(device, [], fakeT);
      expect(result).toBe('setting.builtInMicrophone');
    });

    it('should return setting.builtInSpeaker for a built-in audio output device', () => {
      const device: MediaDeviceInfo = {
        deviceId: DEVICE_1,
        groupId: '0',
        label: 'Speaker (built-in)',
        kind: 'audiooutput',
      };
      const result = DeviceNameHelper.getDeviceName(device, [], fakeT);
      expect(result).toBe('setting.builtInSpeaker');
    });

    it('should return setting.default for a default device', () => {
      const device: MediaDeviceInfo = {
        deviceId: 'default',
        groupId: '0',
        label: 'Speaker (built-in)',
        kind: 'audiooutput',
      };
      const result = DeviceNameHelper.getDeviceName(device, [], fakeT);
      expect(result).toBe('setting.default');
    });

    it('should return setting.default for a device with label that contains "default"', () => {
      const device: MediaDeviceInfo = {
        deviceId: DEVICE_1,
        groupId: '0',
        label: 'Default speaker (built-in)',
        kind: 'audiooutput',
      };
      const result = DeviceNameHelper.getDeviceName(device, [], fakeT);
      expect(result).toBe('setting.default');
    });

    it('should return setting.default for the special "No Devices" device [JPT-2098]', () => {
      const device: MediaDeviceInfo = {
        deviceId: NO_DEVICES_ID,
        groupId: '0',
        label: 'no devices',
        kind: 'audiooutput',
      };
      const result = DeviceNameHelper.getDeviceName(device, [], fakeT);
      expect(result).toBe('setting.noDevices');
    });

    it('should return label of the device when device.label not match any special rules', () => {
      const device: MediaDeviceInfo = {
        deviceId: DEVICE_1,
        groupId: '0',
        label: 'BeatsStudio Wireless',
        kind: 'audiooutput',
      };
      const result = DeviceNameHelper.getDeviceName(device, [], fakeT);
      expect(result).toBe('BeatsStudio Wireless');
    });

    describe('when device.label is empty', () => {
      it('should return device order', () => {
        const speaker1: MediaDeviceInfo = {
          deviceId: DEVICE_1,
          groupId: '0',
          label: '',
          kind: 'audiooutput',
        };
        const speaker2: MediaDeviceInfo = {
          deviceId: DEVICE_2,
          groupId: '0',
          label: '',
          kind: 'audiooutput',
        };
        const allSpeakers = [speaker1, speaker2];
        expect(
          DeviceNameHelper.getDeviceName(speaker1, allSpeakers, fakeT),
        ).toBe('setting.speaker #1');
        expect(
          DeviceNameHelper.getDeviceName(speaker2, allSpeakers, fakeT),
        ).toBe('setting.speaker #2');
      });

      it('should ignore default device when counting devices', () => {
        const speaker1: MediaDeviceInfo = {
          deviceId: DEVICE_1,
          groupId: '0',
          label: '',
          kind: 'audiooutput',
        };
        const defaultSpeaker: MediaDeviceInfo = {
          deviceId: 'default',
          groupId: '0',
          label: 'Default speaker (built-in)',
          kind: 'audiooutput',
        };
        const speaker2: MediaDeviceInfo = {
          deviceId: DEVICE_2,
          groupId: '0',
          label: '',
          kind: 'audiooutput',
        };
        const allSpeakers = [speaker1, defaultSpeaker, speaker2];
        expect(
          DeviceNameHelper.getDeviceName(speaker1, allSpeakers, fakeT),
        ).toBe('setting.speaker #1');
        expect(
          DeviceNameHelper.getDeviceName(speaker2, allSpeakers, fakeT),
        ).toBe('setting.speaker #2');
      });
    });
  });
});
