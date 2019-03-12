/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2019-02-27 15:42:31
 * Copyright © RingCentral. All rights reserved.
 */

interface IRTCMediaDeviceDelegate {
  onMediaDevicesChanged(
    audioOutputs: MediaDeviceInfo[],
    audioInputs: MediaDeviceInfo[],
  ): void;
}

export { IRTCMediaDeviceDelegate };
