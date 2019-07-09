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
} from '@/interface/media';
import { Sound } from './Sound';
import { Utils } from './Utils';

class MediaTrack {
  private _src: string[] = [];
  private _muted: boolean = false;
  private _volume: number = 1;
  private _currentTime: number = 0;

  private _id: string;
  private _url: string = '';
  private _outputDevices: MediaDeviceType[];
  private _sounds: Sound[] = [];
  private _originSound: Sound | null;
  private _masterVolume: number = 1;

  private _mediaId: string;
  private _mediaEvents: MediaEvents[] = [];

  private _playing: boolean = false;

  constructor(options: MediaTrackOptions) {
    this._setup(options);
  }

  play() {
    if (this._url === '') {
      throw new Error('please check media source is valid.');
    }

    this._action('play', null);
    this._playing = true;

    return this;
  }

  pause() {
    this._action('pause', null);
    this._playing = false;
    return this;
  }

  stop() {
    this._action('stop', null);
    this._playing = false;
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
    const volume = vol * this._masterVolume;
    this._action('setVolume', volume);
    this._volume = vol;
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
    this._playing = _continuePlay;
    return this;
  }

  setOutputDevices(devices: MediaDeviceType[]) {
    const playing = this._playing;
    if (this._outputDevices.length === 0) {
      const currentTime = (this._sounds[0] && this._sounds[0].currentTime) || 0;

      this._sounds.forEach(sound => {
        sound.dispose();
      });
      this._sounds = [];

      this._initDeviceSounds(devices, {
        currentTime,
      });
    } else {
      const currentTime =
        (this._originSound && this._originSound.currentTime) || 0;

      this._changeDeviceSounds(devices, {
        currentTime,
      });
    }

    playing && this.play();

    this._outputDevices = devices;

    return this;
  }

  dispose() {
    this._resetTrack();
  }

  setMasterVolume(value: number) {
    if (!Utils.isValidVolume(value)) {
      return;
    }

    this._masterVolume = value;
    this.setVolume(this._volume);
  }

  setOptions(options: MediaTrackOptions) {
    this._resetTrack();
    this._setup(options);
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
    this._muted = options.muted || false;
    this._volume =
      options.volume !== undefined && Utils.isValidVolume(options.volume)
        ? options.volume
        : 1;
    this._currentTime = options.currentTime || 0;
    this._outputDevices = options.outputDevices || [];
    this._masterVolume =
      options.masterVolume !== undefined ? options.masterVolume : 1;
    this._mediaEvents = options.mediaEvents || [];

    this._load();
  }

  private _load() {
    if (this._src.length !== 0) {
      this._url = this._getUrlFromSrcArray(this._src);

      if (this._url === '') {
        return;
      }

      if (this._outputDevices.length !== 0) {
        this._initDeviceSounds(this._outputDevices);
      } else {
        this._sounds.push(this._createSound());
      }
    }
  }

  private _getUrlFromSrcArray(src: MediaOptions['src']) {
    if (src.length === 0) {
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
      /* eslint-disable no-console */
      if (!ext) {
        console.warn('No file extension was found!');
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
      volume: this._volume * this._masterVolume,
      seek: (options && options.seek) || this._currentTime,
      outputDevice: options && options.outputDevice,
      isDeviceSound: options && options.isDeviceSound,
      events: this._mediaEvents,
    });
  }

  private _createOriginSound(options?: { currentTime: number }): Sound {
    return this._createSound({
      id: `${this._id}_originSound`,
      seek: (options && options.currentTime) || 0,
      muted: true,
      volume: 0,
    });
  }

  private _createDeviceSound(
    devices: MediaDeviceType[],
    options?: { currentTime: number },
  ): Sound[] {
    return devices.map(device => this._createSound({
      id: `${this._id}_${device}`,
      outputDevice: device,
      seek: (options && options.currentTime) || 0,
      isDeviceSound: true,
    }));
  }

  private _initDeviceSounds(
    devices: MediaDeviceType[],
    options?: { currentTime: number },
  ) {
    const originSound = this._createOriginSound();
    this._originSound = originSound;
    const deviceSounds = this._createDeviceSound(devices, options);
    this._sounds = deviceSounds;
  }

  private _changeDeviceSounds(
    devices: MediaDeviceType[],
    options?: {
      currentTime: number;
    },
  ) {
    const currentUsedDevices = this._outputDevices;
    const diffDevices = Utils.difference(devices, currentUsedDevices);

    const removeDevices = currentUsedDevices.filter(device => diffDevices.includes(device));
    const addDevices = devices.filter(device => !!diffDevices.includes(device));

    this._removeDeviceSounds(removeDevices);

    const newDeviceSounds = this._createDeviceSound(addDevices, options);
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
    this._sounds.forEach(sound => {
      sound.dispose();
    });
    this._sounds = [];
    if (this._originSound) {
      this._originSound.dispose();
    }
    this._originSound = null;

    this._mediaId = '';
    this._src = [];
    this._url = '';
    this._muted = false;
    this._volume = 1;
    this._currentTime = 0;
    this._outputDevices = [];
    this._mediaEvents = [];
  }

  get masterVolume() {
    return this._masterVolume;
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
    return this._volume;
  }

  get outputDevices() {
    return this._outputDevices;
  }

  get playing() {
    return this._playing;
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

  get currentMediaEvent() {
    return this._mediaEvents;
  }

  get currentMediaUrl() {
    return this._url;
  }
}

export { MediaTrack };
