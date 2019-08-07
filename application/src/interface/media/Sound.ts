/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-27 12:40:00
 * Copyright © RingCentral. All rights reserved.
 */
import { MediaEvents, MediaDeviceType } from './Media';

type SoundOptions = {
  id: string;
  url: string;
  muted: boolean;
  volume: number;
  loop: boolean;
  autoplay: boolean;
  seek: number;
  outputDevice?: MediaDeviceType;
  isDeviceSound?: boolean;
  events?: MediaEvents[];
};

export { SoundOptions };
