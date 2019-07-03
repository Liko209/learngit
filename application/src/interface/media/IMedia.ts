/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-24 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { PlayOptions, MediaEventName, MediaDeviceType } from './Media';

interface IMedia {
  /**
   * Methods
   */
  play: (options?: PlayOptions) => IMedia;
  pause: () => IMedia;
  stop: () => IMedia;
  setMute: (muted: boolean) => IMedia;
  setVolume: (volume: number) => IMedia;
  setOutputDevices: (devices: MediaDeviceType[]) => IMedia;

  setCurrentTime: (time: number, continuePlay?: boolean) => IMedia;

  /**
   * States
   */
  id?: string;
  playing?: boolean;

  /**
   * Listeners
   */
  on: (event: MediaEventName, handler: () => void) => void;
  off: (event: MediaEventName, handler: () => void) => void;
}

export { IMedia };
