/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-24 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */

type MediaOptions = {
  src?: string | string[];
  trackId?: string;
  id?: string;
  muted?: boolean;
  volume?: number;
  loop?: boolean;
  autoplay?: boolean;
  outputDevices?: MediaDeviceType[] | 'all' | null;
};

type PlayOptions = {
  startTime?: number;
};

type MediaEventName =
  | 'abort'
  | 'canplay'
  | 'canplaythrough'
  | 'durationchange'
  | 'emptied'
  | 'ended'
  | 'error'
  | 'loadeddata'
  | 'loadedmetadata'
  | 'loadstart'
  | 'pause'
  | 'play'
  | 'playing'
  | 'progress'
  | 'ratechange'
  | 'seeked'
  | 'seeking'
  | 'stalled'
  | 'suspend'
  | 'timeupdate'
  | 'volumechange'
  | 'waiting';

enum MediaEventType {
  ON = 'on',
  OFF = 'off',
}

type MediaEvents = {
  name: MediaEventName;
  type: MediaEventType.ON | MediaEventType.OFF;
  handler: (event: Event) => void;
};

type MediaDeviceType = MediaDeviceInfo['deviceId'];

export {
  MediaOptions,
  PlayOptions,
  MediaEventName,
  MediaEventType,
  MediaEvents,
  MediaDeviceType,
};
