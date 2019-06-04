/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-04 19:50:04
 * Copyright © RingCentral. All rights reserved.
 */
const NO_DEVICES_ID = 'NO_DEVICE_ID';
const DEFAULT_AUDIO_INPUT_DEVICES: MediaDeviceInfo[] = [
  {
    deviceId: NO_DEVICES_ID,
    label: 'no devices',
    groupId: '',
    kind: 'audioinput',
  },
];

const DEFAULT_AUDIO_OUTPUT_DEVICES: MediaDeviceInfo[] = [
  {
    deviceId: NO_DEVICES_ID,
    label: 'no devices',
    groupId: '',
    kind: 'audiooutput',
  },
];

export {
  DEFAULT_AUDIO_INPUT_DEVICES,
  DEFAULT_AUDIO_OUTPUT_DEVICES,
  NO_DEVICES_ID,
};
