/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2019-02-27 15:42:31
 * Copyright © RingCentral. All rights reserved.
 */

interface IRTCMediaDeviceDelegate {
  onMediaDevicesChanged(
    audioOutputs: {
      devices: MediaDeviceInfo[],
      delta: {
        added: MediaDeviceInfo[],
        deleted: MediaDeviceInfo[],
      },
    },
    audioInputs: {
      devices: MediaDeviceInfo[],
      delta: {
        added: MediaDeviceInfo[],
        deleted: MediaDeviceInfo[],
      },
    },
  ): void;
}

export { IRTCMediaDeviceDelegate };
