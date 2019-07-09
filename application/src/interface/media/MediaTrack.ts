/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-24 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { MediaEvents, MediaDeviceType } from './Media';

type MediaTrackOptions = {
  id: string;
  src?: string | string[];
  volume?: number;
  muted?: boolean;
  currentTime?: number;
  outputDevices?: MediaDeviceType[];
  masterVolume?: number;
  mediaId?: string;
  mediaEvents?: MediaEvents[];
};

const DEFAULT_TRACK_ID = 'default-track';

export { MediaTrackOptions, DEFAULT_TRACK_ID };
