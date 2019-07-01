/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-27 12:40:00
 * Copyright © RingCentral. All rights reserved.
 */
import {
  MediaOptions,
  PlayOptions,
  IMedia,
  MediaEvents,
  MediaEventName,
  MediaEventType,
  DEFAULT_TRACK_ID,
  MediaDeviceType,
} from '@/interface/media';
import { trackManager } from './TrackManager';
import { MediaTrack } from './MediaTrack';
import { Utils } from './Utils';

class Media implements IMedia {
  private _trackId: MediaOptions['trackId'];
  private _mediaId: MediaOptions['id'];
  private _src: MediaOptions['src'];
  private _volume: MediaOptions['volume'];
  private _muted: MediaOptions['muted'];
  private _outputDevices: MediaDeviceType[];
  private _currentTime: number;
  private _useTrack: MediaTrack;
  private _events: MediaEvents[] = [];

  constructor(options: MediaOptions) {
    this._setup(options);
  }

  play(playOpts?: PlayOptions) {
    if ((Array.isArray(this._src) && this._src.length === 0) || !this._src) {
      throw new Error('please check your media source.');
    }
    const isMediaInTrack = this._isMediaInTrack();
    const isPlaying = this._useTrack.playing;
    const startTime = playOpts && playOpts.startTime !== undefined;

    if (isMediaInTrack && isPlaying && startTime) {
      this._useTrack.setCurrentTime(
        (playOpts && playOpts.startTime) || 0,
        true,
      );
    } else if (isMediaInTrack && isPlaying) {
      return this;
    } else if (isMediaInTrack && !isPlaying) {
      this._useTrack.setCurrentTime(this._currentTime, true);
    } else {
      const options = this._getCurrentMediaOptions();
      this._useTrack.setOptions(
        Object.assign({}, options, {
          currentTime:
            (playOpts && playOpts.startTime) || this._currentTime || 0,
          events: this._events,
        }),
      );
      this._useTrack.play();
    }

    return this;
  }

  pause() {
    if (this._isMediaInTrack() && this._useTrack.playing) {
      this._useTrack.pause();
      this._currentTime = this._useTrack.currentTime;
    } else {
      throw new Error('This media is not playing now.');
    }
    return this;
  }

  stop() {
    if (this._isMediaInTrack()) {
      this._useTrack.stop();
      this._currentTime = 0;
    } else {
      throw new Error('This media is not playing now.');
    }
    return this;
  }

  setMute(muted: boolean) {
    if (this._isMediaInTrack()) {
      this._useTrack.setMute(muted);
    }
    this._muted = muted;
    return this;
  }

  setVolume(volume: number) {
    if (this._isMediaInTrack()) {
      this._useTrack.setVolume(volume);
    }
    this._volume = volume;
    return this;
  }

  setOutputDevices(devices: MediaOptions['outputDevices']) {
    if (this._isMediaInTrack()) {
      if (Array.isArray(devices)) {
        this._useTrack.setOutputDevices(devices);
        this._outputDevices = devices;
      } else if (devices === 'all') {
        const allOutputDevicesId = trackManager.getAllOutputDevicesId();
        this._useTrack.setOutputDevices(allOutputDevicesId);
        this._outputDevices = allOutputDevicesId;
      }
    } else {
      if (Array.isArray(devices)) {
        this._outputDevices = devices;
      } else if (devices === 'all') {
        this._outputDevices = trackManager.getAllOutputDevicesId();
      }
    }
    return this;
  }

  setCurrentTime(time: number, continuePlay?: boolean) {
    if (this._isMediaInTrack()) {
      this._useTrack.setCurrentTime(time, continuePlay);
    }
    this._currentTime = time;
    return this;
  }

  on(eventName: MediaEventName, handler: () => void) {
    this._events.push({
      handler,
      name: eventName,
      type: MediaEventType.ON,
    });
  }

  off(eventName: MediaEventName, handler: () => void) {
    this._events.push({
      handler,
      name: eventName,
      type: MediaEventType.OFF,
    });
  }

  private _setup(o: MediaOptions) {
    this._trackId = o.trackId;
    this._mediaId = o.id;
    this._src = o.src;
    this._volume =
      o.volume && Utils.isValidVolume(o.volume) ? o.volume : 1 || 1;
    this._muted = o.muted || false;
    this._currentTime = 0;
    this._outputDevices =
      o.outputDevices && Array.isArray(o.outputDevices)
        ? o.outputDevices
        : trackManager.getAllOutputDevicesId();

    const useTrack = this._getUseTrack();
    if (!useTrack) {
      throw new Error('Media setup error');
    }
    this._useTrack = useTrack;
  }

  private _getUseTrack() {
    return this._trackId && trackManager.getTrack(this._trackId);
  }

  private _isMediaInTrack() {
    return this._useTrack.currentMediaId === this._mediaId;
  }

  private _getCurrentMediaOptions() {
    return {
      id: this._trackId || DEFAULT_TRACK_ID,
      mediaId: this._mediaId,
      src: this._src,
      volume: this._volume,
      muted: this._muted,
      outputDevices: this._outputDevices,
      currentTime: 0,
    };
  }

  get id() {
    return this._mediaId;
  }

  get src() {
    return this._src;
  }

  get trackId() {
    return this._trackId;
  }

  get volume() {
    return this._volume;
  }

  get muted() {
    return this._muted;
  }

  get outputDevices() {
    return this._outputDevices;
  }

  get events() {
    return this._events;
  }

  get playing() {
    return this._isMediaInTrack() && this._useTrack.playing;
  }
}

export { Media };
