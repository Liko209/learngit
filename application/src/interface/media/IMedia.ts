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
  setSrc: (src: string | string[]) => IMedia;
  setLoop: (loop: boolean) => IMedia;
  setMute: (muted: boolean) => IMedia;
  setVolume: (volume: number) => IMedia;
  setOutputDevices: (devices: MediaDeviceType[] | 'all' | null) => IMedia;
  setCurrentTime: (time: number, continuePlay?: boolean) => IMedia;
  dispose: () => void;
  onReset: (handler: () => void) => void;

  /**
   * States
   */
  id: string;
  src: string | string[];
  muted: boolean;
  volume: number;
  loop: boolean;
  currentTime: number;
  duration: number;
  playing: boolean;

  /**
   * Listeners
   */
  on: (event: MediaEventName, handler: (event: Event) => void) => void;
  off: (event: MediaEventName, handler: (event: Event) => void) => void;
}

export { IMedia };
