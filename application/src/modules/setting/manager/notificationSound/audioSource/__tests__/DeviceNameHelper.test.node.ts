/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-04 21:04:31
 * Copyright © RingCentral. All rights reserved.
 */
import { DeviceNameHelper } from '../DeviceNameHelper';

const DEVICE_1 = 'DEVICE_1';
const DEVICE_2 = 'DEVICE_2';

const fakeT = (str: any) => str;

const buildFakeDevice = (device: {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
  groupId?: string;
}) => {
  return {
    ...device,
    groupId: '0',
    toJSON() {
      return JSON.stringify(this);
    },
  };
};

describe('DeviceNameHelper', () => {
  describe('getDeviceName()', () => {
    it('should return original label for a built-in audio input device [JPT-2798]', () => {
      const device = buildFakeDevice({
        deviceId: DEVICE_1,
        label: 'Microphone (built-in)',
        kind: 'audioinput',
      });
      const result = DeviceNameHelper.getDeviceName(device, [], fakeT);
      expect(result).toBe('Microphone (built-in)');
    });

    it('should return original label for a built-in audio output device [JPT-2798]', () => {
      const device = buildFakeDevice({
        deviceId: DEVICE_1,
        label: 'Speaker (built-in)',
        kind: 'audiooutput',
      });
      const result = DeviceNameHelper.getDeviceName(device, [], fakeT);
      expect(result).toBe('Speaker (built-in)');
    });

    it('should return setting.useDefault for a default device', () => {
      const device = buildFakeDevice({
        deviceId: 'default',
        label: 'Speaker (built-in)',
        kind: 'audiooutput',
      });
      const result = DeviceNameHelper.getDeviceName(device, [], fakeT);
      expect(result).toBe('setting.useDefault');
    });

    it('should return setting.useDefault for a device with label that contains "default"', () => {
      const device = buildFakeDevice({
        deviceId: DEVICE_1,
        label: 'Default speaker (built-in)',
        kind: 'audiooutput',
      });
      const result = DeviceNameHelper.getDeviceName(device, [], fakeT);
      expect(result).toBe('setting.useDefault');
    });

    it('should return setting.useDefault for the special "No Devices" device [JPT-2098]', () => {
      const device = buildFakeDevice({
        deviceId: '',
        label: 'no devices',
        kind: 'audiooutput',
      });
      const result = DeviceNameHelper.getDeviceName(device, [], fakeT);
      expect(result).toBe('setting.noDevices');
    });

    it('should return label of the device when device.label not match any special rules', () => {
      const device = buildFakeDevice({
        deviceId: DEVICE_1,
        label: 'BeatsStudio Wireless',
        kind: 'audiooutput',
      });
      const result = DeviceNameHelper.getDeviceName(device, [], fakeT);
      expect(result).toBe('BeatsStudio Wireless');
    });

    describe('when device.label is empty [JPT-2418]', () => {
      it('should return device order', () => {
        const speaker1 = buildFakeDevice({
          deviceId: DEVICE_1,
          label: '',
          kind: 'audiooutput',
        });
        const speaker2 = buildFakeDevice({
          deviceId: DEVICE_2,
          label: '',
          kind: 'audiooutput',
        });
        const allSpeakers = [speaker1, speaker2];
        expect(
          DeviceNameHelper.getDeviceName(speaker1, allSpeakers, fakeT),
        ).toBe('setting.speaker #1');
        expect(
          DeviceNameHelper.getDeviceName(speaker2, allSpeakers, fakeT),
        ).toBe('setting.speaker #2');
      });

      it('should ignore default device when counting devices', () => {
        const speaker1 = buildFakeDevice({
          deviceId: DEVICE_1,
          label: '',
          kind: 'audiooutput',
        });
        const defaultSpeaker = buildFakeDevice({
          deviceId: 'default',
          label: 'Default speaker (built-in)',
          kind: 'audiooutput',
        });
        const speaker2 = buildFakeDevice({
          deviceId: DEVICE_2,
          label: '',
          kind: 'audiooutput',
        });
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
