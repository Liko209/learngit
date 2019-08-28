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
  MediaTrackOptions,
} from '@/interface/media';
import { trackManager } from './TrackManager';
import { MediaTrack } from './MediaTrack';
import { Utils } from './Utils';

class Media implements IMedia {
  private _trackId: MediaOptions['trackId'];
  private _mediaId: string;
  private _src: MediaOptions['src'] = '';
  private _muted: boolean;
  private _volume: number;
  private _loop: boolean;
  private _autoplay: boolean;
  private _outputDevices: MediaDeviceType[] | null;
  private _currentTime: number;
  private _useTrack: MediaTrack;
  private _events: MediaEvents[] = [];
  private _onResetHandlers: (() => void)[] = [];
  private _onDisposedHandler: () => void;

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
    } else if (isMediaInTrack && !isPlaying && startTime) {
      this._useTrack.setCurrentTime(
        (playOpts && playOpts.startTime) || 0,
        true,
      );
    } else if (isMediaInTrack && !isPlaying) {
      this._useTrack.setCurrentTime(this._currentTime, true);
    } else {
      const options = this._getCurrentMediaOptions();
      this._useTrack.setOptions(
        Object.assign({}, options, {
          currentTime:
            (playOpts && playOpts.startTime) || this._currentTime || 0,
          mediaEvents: this._events,
          onReset: () => this._resetMedia(),
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
    }
    return this;
  }

  stop() {
    if (this._isMediaInTrack()) {
      this._useTrack.stop();
    }
    this._currentTime = 0;
    return this;
  }

  setSrc(src: MediaOptions['src']) {
    if (this._isMediaInTrack()) {
      this.dispose();
    }
    this._src = src;
    this._resetMedia();
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
      this._useTrack.setMediaVolume(volume);
    }
    this._volume = volume;
    return this;
  }

  setLoop(loop: boolean) {
    if (this._isMediaInTrack()) {
      this._useTrack.setLoop(loop);
    }
    this._loop = loop;
    return this;
  }

  setOutputDevices(devices: MediaOptions['outputDevices']) {
    const isMediaInTrack = this._isMediaInTrack();
    if (Array.isArray(devices)) {
      isMediaInTrack && this._useTrack.setOutputDevices(devices);
      this._outputDevices = devices;
    } else if (devices === 'all') {
      const allOutputDevicesId = trackManager.getAllOutputDevicesId();
      isMediaInTrack && this._useTrack.setOutputDevices(allOutputDevicesId);
      this._outputDevices = allOutputDevicesId;
    } else if (devices === null) {
      isMediaInTrack && this._useTrack.setOutputDevices(null);
      this._outputDevices = null;
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

  on(eventName: MediaEventName, handler: (event: Event) => void) {
    this._events.push({
      handler,
      name: eventName,
      type: MediaEventType.ON,
    });
    if (this._isMediaInTrack()) {
      this._useTrack.bindEvent(eventName, handler);
    }
  }

  off(eventName: MediaEventName, handler: (event: Event) => void) {
    this._events = this._events.filter(
      evt => !(evt.name === eventName && evt.handler === handler),
    );
    if (this._isMediaInTrack()) {
      this._useTrack.unbindEvent(eventName, handler);
    }
  }

  dispose() {
    if (this._isMediaInTrack()) {
      this._useTrack.dispose();
    }
    this._resetMedia();
    this._onDisposedHandler && this._onDisposedHandler();
  }

  onReset(handler: () => void) {
    this._onResetHandlers.push(handler);
  }

  onDisposed(handler: () => void) {
    this._onDisposedHandler = handler;
  }

  private _resetMedia = () => {
    this._currentTime = 0;
    this._onResetHandlers &&
      this._onResetHandlers.forEach(handler => handler());
    if (this._isMediaInTrack()) {
      this._useTrack.dispose();
    }
  };

  private _setup(o: MediaOptions) {
    this._trackId = o.trackId;
    this._mediaId = o.id || '';
    this._src = o.src || '';
    this._muted = o.muted || false;
    this._volume =
      o.volume && Utils.isValidVolume(o.volume) ? o.volume : 1 || 1;
    this._loop = o.loop || false;
    this._autoplay = o.autoplay || false;
    this._currentTime = 0;
    this._outputDevices =
      o.outputDevices && Array.isArray(o.outputDevices)
        ? o.outputDevices
        : o.outputDevices === null || o.outputDevices === undefined
        ? null
        : trackManager.getAllOutputDevicesId();

    const useTrack = this._getUseTrack();
    if (!useTrack) {
      throw new Error('Media setup error');
    }
    this._useTrack = useTrack;

    this._autoplay && this.play();
  }

  private _getUseTrack() {
    return this._trackId && trackManager.getTrack(this._trackId);
  }

  private _isMediaInTrack() {
    return this._useTrack.currentMediaId === this._mediaId;
  }

  private _getCurrentMediaOptions(): MediaTrackOptions {
    return {
      id: this._trackId || DEFAULT_TRACK_ID,
      mediaId: this._mediaId,
      src: this._src,
      muted: this._muted,
      mediaVolume: this._volume,
      loop: this._loop,
      autoplay: this._autoplay,
      outputDevices: this._outputDevices,
      currentTime: 0,
    };
  }

  get id() {
    return this._mediaId;
  }

  get src() {
    return this._src || '';
  }

  get trackId() {
    return this._trackId;
  }

  get muted() {
    return this._muted;
  }

  get volume() {
    return this._volume;
  }

  get loop() {
    return this._loop;
  }

  get autoplay() {
    return this._autoplay;
  }

  get currentTime() {
    return this._isMediaInTrack()
      ? this._useTrack.currentTime
      : this._currentTime || 0;
  }

  get duration() {
    return this._isMediaInTrack() ? this._useTrack.currentMediaDuration : 0;
  }

  get outputDevices() {
    return this._outputDevices;
  }

  get events() {
    return this._events;
  }

  get playing() {
    return (this._isMediaInTrack() && this._useTrack.playing) || false;
  }
}

export { Media };
