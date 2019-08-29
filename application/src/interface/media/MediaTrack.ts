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
  loop?: boolean;
  autoplay?: boolean;
  currentTime?: number;
  outputDevices?: MediaDeviceType[] | null;
  masterVolume?: number;
  duckVolume?: number;
  mediaId?: string;
  mediaVolume?: number;
  mediaEvents?: MediaEvents[];
  onReset?: () => void;
  weight?: number;
};

const DEFAULT_TRACK_ID = 'default-track';

export { MediaTrackOptions, DEFAULT_TRACK_ID };
