/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2019-02-27 15:42:31
 * Copyright © RingCentral. All rights reserved.
 */
import { PermissionState } from '../utils/types';

interface IRTCMediaDeviceDelegate {
  onMediaDevicesInitialed(
    audioOutputs: MediaDeviceInfo[],
    audioInputs: MediaDeviceInfo[],
  ): void;
  onMediaPermissionChanged(
    newState: PermissionState,
    preState: PermissionState,
  ): void;
  onMediaDevicesChanged(
    audioOutputs: {
      devices: MediaDeviceInfo[];
      delta: {
        hashChanged: boolean;
        added: MediaDeviceInfo[];
        deleted: MediaDeviceInfo[];
      };
    },
    audioInputs: {
      devices: MediaDeviceInfo[];
      delta: {
        hashChanged: boolean;
        added: MediaDeviceInfo[];
        deleted: MediaDeviceInfo[];
      };
    },
  ): void;
}

export { IRTCMediaDeviceDelegate };
