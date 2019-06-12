/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-04 19:50:04
 * Copyright © RingCentral. All rights reserved.
 */
const DEFAULT_AUDIO_INPUT_DEVICES: MediaDeviceInfo[] = [
  {
    deviceId: '',
    label: 'no devices',
    groupId: '',
    kind: 'audioinput',
  },
];

const DEFAULT_AUDIO_OUTPUT_DEVICES: MediaDeviceInfo[] = [
  {
    deviceId: '',
    label: 'no devices',
    groupId: '',
    kind: 'audiooutput',
  },
];

export { DEFAULT_AUDIO_INPUT_DEVICES, DEFAULT_AUDIO_OUTPUT_DEVICES };
