/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-27 12:40:00
 * Copyright © RingCentral. All rights reserved.
 */
import {
  MediaEvents,
  MediaOptions,
  MediaDeviceType,
  MediaTrackOptions,
  MediaEventName,
} from '@/interface/media';
import { Sound } from './Sound';
import { Utils } from './Utils';
import { mainLogger } from 'foundation/log';

const noPlayEventName: MediaEventName[] = ['pause', 'ended', 'abort', 'error'];
const playingEventName: MediaEventName[] = ['play', 'playing'];

class MediaTrack {
  private _src: string[] = [];
  private _muted: boolean = false;
  private _loop: boolean = false;
  private _autoplay: boolean = false;
  private _mediaVolume: number = 1;
  private _trackVolume: number = 1;
  private _duckVolume: number = 1;
  private _currentTime: number = 0;

  private _id: string;
  private _url: string = '';
  private _outputDevices: MediaDeviceType[] | null;
  private _sounds: Sound[] = [];
  private _originSound: Sound | null;
  private _masterVolume: number = 1;

  private _mediaId: string;
  private _mediaEvents: MediaEvents[] = [];
  private _preMediaRester: (() => void) | null;
  private _weight: number;
  private _onPlayingEvent: (isPlaying: boolean) => void;

  constructor(options: MediaTrackOptions) {
    this._setup(options);
  }

  play() {
    if (this._url === '') {
      throw new Error('please check media source is valid.');
    }

    this._action('play', null);
    return this;
  }

  pause() {
    this._action('pause', null);
    return this;
  }

  stop() {
    this._action('stop', null);
    this._currentTime = 0;
    return this;
  }

  setMute(muted: boolean) {
    this._action('setMute', muted);
    this._muted = muted;
    return this;
  }

  setVolume(vol: number) {
    if (!Utils.isValidVolume(vol)) {
      return;
    }
    this._trackVolume = vol;
    this._action('setVolume', this._computedSoundVolume());
    return this;
  }

  setLoop(loop: boolean) {
    this._action('setLoop', loop);
    this._loop = loop;
    return this;
  }

  setCurrentTime(time: number, continuePlay?: boolean) {
    if (this._url === '' && continuePlay) {
      throw new Error('please check media source is valid.');
    }

    const _continuePlay = continuePlay !== undefined ? continuePlay : true;
    this._action('setSeek', time, {
      continuePlay: _continuePlay,
    });

    this._currentTime = time;
    return this;
  }

  setOutputDevices(devices: MediaDeviceType[] | null) {
    if (devices === this._outputDevices) {
      return;
    }

    const playing = this._isSoundPlaying();

    if (Array.isArray(devices)) {
      if (this._outputDevices === null) {
        // media track not output device before, clear all sound and init device sound
        const currentTime =
          (this._sounds[0] && this._sounds[0].currentTime) || 0;
        this._sounds.forEach(sound => sound.dispose());
        this._sounds = [];

        this._initDeviceSounds(devices, {
          currentTime,
        });
      } else {
        // media track has output device before, change device sound
        const currentTime =
          (this._originSound && this._originSound.currentTime) || 0;

        this._changeDeviceSounds(devices, {
          currentTime,
        });
      }
    } else if (devices === null) {
      // remove all device sound and origin sound
      const currentTime =
        (this._originSound && this._originSound.currentTime) || 0;

      this._originSound && this._originSound.dispose();
      this._sounds.forEach(sound => sound.dispose());
      this._sounds = [];

      this._initNoDeviceSound({
        currentTime,
      });
    }

    playing && this.play();

    this._outputDevices = devices;

    return this;
  }

  setMasterVolume(vol: number) {
    if (!Utils.isValidVolume(vol)) {
      return;
    }

    this._masterVolume = vol;
    this._action('setVolume', this._computedSoundVolume());
  }

  setDuckVolume(vol: number) {
    if (!Utils.isValidVolume(vol)) {
      return;
    }
    this._duckVolume = vol;
    this._action('setVolume', this._computedSoundVolume());
  }

  setMediaVolume(vol: number) {
    if (!Utils.isValidVolume(vol)) {
      return;
    }

    this._mediaVolume = vol;
    this._action('setVolume', this._computedSoundVolume());
  }

  setOptions(options: MediaTrackOptions) {
    this._preMediaRester && this._preMediaRester();
    this._resetTrack();
    this._setup(options);
  }

  dispose() {
    this._resetTrack();
  }

  bindEvent(eventName: MediaEventName, handler: (event: Event) => void) {
    if (this._originSound) {
      this._originSound.bindEvent(eventName, handler);
    } else if (this._sounds[0]) {
      this._sounds[0].bindEvent(eventName, handler);
    }
  }

  unbindEvent(eventName: MediaEventName, handler: (event: Event) => void) {
    const hasEvent = this._mediaEvents.some(evt => evt.name === eventName);
    if (hasEvent) {
      this._mediaEvents = this._mediaEvents.filter(
        evt => !(evt.name === eventName && evt.handler === handler),
      );
      if (this._originSound) {
        this._originSound.unbindEvent(eventName, handler);
      } else if (this._sounds[0]) {
        this._sounds[0].unbindEvent(eventName, handler);
      }
    }
  }

  onPlaying(evt: (isPlaying: boolean) => void) {
    this._onPlayingEvent = evt;
  }

  private _setup(options: MediaTrackOptions) {
    this._id = options.id;
    this._mediaId = options && options.mediaId ? options.mediaId : '';
    this._src =
      typeof options.src !== 'string'
        ? options.src || []
        : options.src
        ? [options.src]
        : [];
    this._trackVolume =
      options.volume !== undefined && Utils.isValidVolume(options.volume)
        ? options.volume
        : this._trackVolume;
    this._muted = options.muted || false;
    this._loop = options.loop || false;
    this._autoplay = options.autoplay || false;
    this._currentTime = options.currentTime || 0;
    this._outputDevices = options.outputDevices || null;
    this._masterVolume =
      options.masterVolume !== undefined
        ? options.masterVolume
        : this._masterVolume;
    this._duckVolume =
      options.duckVolume !== undefined
        ? options.duckVolume
        : this._duckVolume;
    this._mediaVolume =
      options.mediaVolume !== undefined &&
      Utils.isValidVolume(options.mediaVolume)
        ? options.mediaVolume
        : this._mediaVolume;
    this._mediaEvents = options.mediaEvents || [];
    this._preMediaRester = options.onReset || null;
    this._weight =
      options.weight !== undefined ? options.weight : this._weight || 9999;

    this._load();
  }

  private _load() {
    if (this._src.length !== 0) {
      this._url = this._getUrlFromSrcArray(this._src);

      if (this._url === '') {
        return;
      }

      let eventSound: Sound;

      if (this._outputDevices === null) {
        eventSound = this._initNoDeviceSound();
      } else {
        eventSound = this._initDeviceSounds(this._outputDevices);
      }

      eventSound && this._bindTrackEvent(eventSound);
    }
  }

  private _trackPlayingEvent = () => {
    this._onPlayingEvent(true);
  };

  private _trackNoPlayingEvent = () => {
    this._onPlayingEvent(false);
  };

  private _bindTrackEvent(sound: Sound) {
    noPlayEventName.forEach(evtName => {
      sound.bindEvent(evtName, this._trackNoPlayingEvent, false);
    });
    playingEventName.forEach(evtName => {
      sound.bindEvent(evtName, this._trackPlayingEvent, false);
    });
  }

  private _unBindTrackEvent(sound: Sound) {
    noPlayEventName.forEach(evtName => {
      sound.unbindEvent(evtName, this._trackNoPlayingEvent);
    });
    playingEventName.forEach(evtName => {
      sound.unbindEvent(evtName, this._trackPlayingEvent);
    });
  }

  private _getUrlFromSrcArray(src: MediaOptions['src']) {
    if (!src || (src && src.length === 0)) {
      return '';
    }
    let url: string = '';
    let i = 0;
    const srcLen = src.length;
    for (; i < srcLen; i++) {
      let ext = null;
      const str = this._src[i];
      // ext is URL or base64 URI
      ext = /^data:audio\/([^;,]+);/i.exec(str);
      if (!ext) {
        ext = /\.([^.]+)$/.exec(str.split('?', 1)[0]);
      }
      if (ext) {
        ext = ext[1].toLowerCase();
      }
      if (!ext) {
        mainLogger.warn('[MediaModule] No file extension was found!');
      }

      if (ext) {
        url = this._src[i];
        break;
      }
    }
    return url;
  }

  private _createSound(options?: any): Sound {
    return new Sound({
      id: (options && options.id) || this._mediaId,
      url: this._url,
      muted:
        options && options.muted !== undefined ? options.muted : this._muted,
      volume: this._computedSoundVolume(),
      loop: options && options.loop !== undefined ? options.loop : this._loop,
      autoplay:
        options && options.autoplay !== undefined
          ? options.autoplay
          : this._autoplay,
      seek: (options && options.seek) || this._currentTime,
      outputDevice: options && options.outputDevice,
      isDeviceSound: options && options.isDeviceSound,
      events: this._mediaEvents,
    });
  }

  private _createOriginSound(options?: { currentTime: number }): Sound {
    return this._createSound({
      id: `${this._mediaId}-[originSound]`,
      seek: (options && options.currentTime) || 0,
      muted: true,
      volume: 0,
    });
  }

  private _createDeviceSound(
    devices: MediaDeviceType[],
    options?: { currentTime: number },
  ): Sound[] {
    return devices.map(device =>
      this._createSound({
        id: `${this._mediaId}-[${device}]`,
        outputDevice: device,
        seek: (options && options.currentTime) || 0,
        isDeviceSound: true,
      }),
    );
  }

  private _initNoDeviceSound(options?: { currentTime: number }) {
    const notDeviceSound = this._createSound(options);
    this._sounds = [notDeviceSound];
    return notDeviceSound;
  }

  private _initDeviceSounds(
    devices: MediaDeviceType[],
    options?: { currentTime: number },
  ) {
    const originSound = this._createOriginSound();
    this._originSound = originSound;
    const deviceSounds = this._createDeviceSound(devices, options);
    this._sounds = deviceSounds;
    return originSound;
  }

  private _changeDeviceSounds(
    devices: MediaDeviceType[],
    options?: {
      currentTime: number;
    },
  ) {
    const currentUsedDevices = this._outputDevices;
    if (Array.isArray(currentUsedDevices)) {
      this._removeDeviceSounds(currentUsedDevices);
    }

    const newDeviceSounds = this._createDeviceSound(devices, options);
    newDeviceSounds.forEach(sound => {
      this._sounds.push(sound);
    });
  }

  private _removeDeviceSounds(devices: MediaDeviceType[]) {
    devices.forEach(device => {
      let i = 0;
      const soundLen = this._sounds.length;
      for (; i < soundLen; i++) {
        const sound = this._sounds[i];
        if (sound.id.indexOf(device) !== -1) {
          sound.dispose();
          this._sounds.splice(i, 1);
          break;
        }
      }
    });
  }

  private _action(
    type: string,
    value?: string | boolean | number | null,
    opts?: any,
  ) {
    if (!type) {
      return;
    }

    if (this._sounds && this._sounds.length !== 0) {
      this._sounds.forEach(sound => {
        sound && sound[`${type}`](value, opts);
      });
    }
    if (this._originSound) {
      if (type === 'setMute') {
        this._originSound.dispatchEvent(new Event('volumechange'));
      } else {
        this._originSound[`${type}`](value, opts);
      }
    }
  }

  private _resetTrack() {
    this._disposeSound();
    this._onPlayingEvent && this._onPlayingEvent(false);

    this._mediaId = '';
    this._src = [];
    this._url = '';
    this._muted = false;
    this._trackVolume = 1;
    this._currentTime = 0;
    this._outputDevices = [];
    this._mediaEvents = [];
  }

  private _disposeSound() {
    if (this._originSound) {
      this._unBindTrackEvent(this._originSound);
    } else if (this._sounds[0]) {
      this._unBindTrackEvent(this._sounds[0]);
    }

    this._sounds.forEach(sound => {
      sound.dispose();
    });
    this._sounds = [];
    if (this._originSound) {
      this._originSound.dispose();
    }
    this._originSound = null;
  }

  private _isSoundPlaying() {
    return (
      (this._originSound && !this._originSound.paused) ||
      (this._sounds[0] && !this._sounds[0].paused) ||
      false
    );
  }

  private _computedSoundVolume() {
    return this._masterVolume * this._trackVolume * this._mediaVolume * this._duckVolume;
  }

  get masterVolume() {
    return this._masterVolume;
  }

  get duckVolume() {
    return this._duckVolume;
  }

  get id() {
    return this._id;
  }

  get src() {
    return this._src;
  }

  get sounds() {
    return this._sounds;
  }

  get muted() {
    return this._muted;
  }

  get volume() {
    return this._trackVolume;
  }

  get loop() {
    return this._loop;
  }

  get autoplay() {
    return this._autoplay;
  }

  get outputDevices() {
    return this._outputDevices;
  }

  get playing() {
    return this._isSoundPlaying();
  }

  get currentTime() {
    return (
      (this._originSound && this._originSound.currentTime) ||
      (this._sounds[0] && this._sounds[0].currentTime) ||
      this._currentTime ||
      0
    );
  }

  get currentMediaId() {
    return this._mediaId;
  }

  get currentMediaVolume() {
    return this._mediaVolume;
  }

  get currentMediaEvent() {
    return this._mediaEvents;
  }

  get currentMediaUrl() {
    return this._url;
  }

  get currentMediaDuration() {
    return (
      (this._originSound && this._originSound.duration) ||
      (this._sounds[0] && this._sounds[0].duration) ||
      0
    );
  }

  get weight() {
    return this._weight;
  }

  get currentSoundVolume() {
    return this._computedSoundVolume();
  }
}

export { MediaTrack };
