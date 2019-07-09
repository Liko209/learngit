/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-27 12:40:00
 * Copyright © RingCentral. All rights reserved.
 */
import { SoundOptions, MediaEventName } from '@/interface/media';
import { Utils } from './Utils';

/* eslint-disable */
class Sound {
  private _id: SoundOptions['id'];
  private _url: SoundOptions['url'];
  private _muted: SoundOptions['muted'];
  private _volume: SoundOptions['volume'];
  private _outputDevice: SoundOptions['outputDevice'];
  private _isDeviceSound: SoundOptions['isDeviceSound'];
  private _events: SoundOptions['events'];

  private _duration: number;
  private _paused: boolean;
  private _ended: boolean;
  private _seek: number;
  private _hasSinkId: boolean;

  private _node: (HTMLMediaElement & { setSinkId?: any; sinkId?: any }) | null;

  constructor(options: SoundOptions) {
    this._setup(options);
  }

  play() {
    this._soundPlay();
  }

  pause() {
    this._soundPause();
  }

  stop() {
    this._soundStop();
  }

  setMute(muted: boolean) {
    this._soundMute(muted);
  }

  setVolume(vol: number) {
    this._soundVolume(vol);
  }

  setSeek(
    time: number,
    opts?: {
      continuePlay: boolean;
    },
  ) {
    if (time < 0 || time > this._duration) {
      return;
    }
    const isPlaying = !this._paused;

    this._soundPause();
    this._seek = time;

    if (isPlaying) {
      if (opts && !opts.continuePlay) {
        return;
      }
      this._soundPlay();
    } else {
      opts && opts.continuePlay && this._soundPlay();
    }
  }

  dispose() {
    this.stop();
    this._node = null;
  }

  dispatchEvent(event: Event) {
    if (!this._node) {
      return;
    }
    this._node.dispatchEvent(event);
  }

  private _setup(options: SoundOptions) {
    this._id = options.id;
    this._url = options.url;
    this._muted = options.muted;
    this._volume = Utils.isValidVolume(options.volume) ? options.volume : 1;
    this._seek = options.seek || 0;
    this._outputDevice = options.outputDevice;
    this._isDeviceSound = options.isDeviceSound || false;
    this._events = options.events || [];
    this._paused = true;
    this._ended = true;

    this._createAudio();
  }

  private _createAudio() {
    this._node = this._createHtml5Audio();

    const soundError = () => {
      if (this._node) {
        this._paused = true;
        this._ended = true;
        this._node.removeEventListener('error', soundError, false);
      }
    };

    const soundCanplay = () => {
      if (this._node) {
        this._duration = Math.ceil(this._node.duration * 10) / 10;
        this._node.removeEventListener('canplay', soundCanplay, false);
      }
    };

    this._node.addEventListener('error', soundError, false);
    this._node.addEventListener('canplay', soundCanplay, false);

    this._node.src = this._url;
    this._node.preload = 'auto';
    this._node.volume = this._volume;
    this._node.muted = this._muted;
    if (this._outputDevice && this._node.setSinkId) {
      this._node
        .setSinkId(this._outputDevice)
        .then(() => {
          this._hasSinkId = true;
        })
        .catch(() => {
          this._hasSinkId = false;
        });
    }

    this._soundEventBind();

    this._node.load();
  }

  private _soundPlay() {
    if (!this._node || !this._paused) {
      return;
    }

    this._node.currentTime = Math.max(0, this._seek);
    this._node.muted = this._muted;
    this._node.volume = this._volume;

    const html5AudioPlay = () => {
      if (!this._node) {
        return;
      }
      try {
        const play = this._node.play();

        this._paused = false;
        this._ended = false;

        if (play) {
          play
            .then(() => {
              if (this._isDeviceSound && !this._hasSinkId) {
                this._soundStop();
                return;
              }
            })
            .catch(e => {
              this._paused = true;
              this._ended = true;
            });
        }

        const endedListener = () => {
          if (!this._node) {
            return;
          }
          this._paused = true;
          this._ended = true;
          this._node.removeEventListener('ended', endedListener, false);
        };

        this._node.addEventListener('ended', endedListener, false);
      } catch (e) {}
    };

    if (this._node.readyState >= 3) {
      html5AudioPlay();
    } else {
      const listener = () => {
        if (!this._node) {
          return;
        }
        html5AudioPlay();
        this._node.removeEventListener('canplaythrough', listener, false);
      };

      this._node.addEventListener('canplaythrough', listener, false);
    }
  }

  private _soundPause() {
    if (!this._node || this._paused) {
      return;
    }

    const currentTime = this._node.currentTime;
    if (currentTime !== 0) {
      this._seek = currentTime;
    }

    this._node.pause();
    this._paused = true;
  }

  private _soundStop() {
    this._soundPause();
    this._resetSound();
  }

  private _soundMute(muted: boolean) {
    if (!this._node) {
      return;
    }
    this._muted = muted;
    this._node.muted = muted;
  }

  private _soundVolume(volume: number) {
    if (!Utils.isValidVolume(volume) || !this._node) {
      return;
    }

    this._volume = volume;
    this._node.volume = volume;
  }

  private _soundEventBind() {
    if (this._events && this._events.length !== 0) {
      this._events.forEach(event => {
        const { name, type, handler } = event;
        if (type === 'on') {
          this._on(name, handler);
        } else if (type === 'off') {
          this._off(name, handler);
        }
      });
    }
  }

  private _on(event: MediaEventName, handler: () => void) {
    if (!this._node || this._isDeviceSound) {
      return;
    }
    this._node.addEventListener(event, handler, false);
  }

  private _off(event: MediaEventName, handler: () => void) {
    if (!this._node || this._isDeviceSound) {
      return;
    }
    this._node.removeEventListener(event, handler, false);
  }

  private _resetSound() {
    this._paused = true;
    this._ended = true;
    this._seek = 0;
  }

  private _createHtml5Audio() {
    const testPlay: any = new Audio().play();
    if (
      testPlay &&
      typeof Promise !== 'undefined' &&
      (testPlay instanceof Promise || typeof testPlay.then === 'function')
    ) {
      testPlay.catch(() => {
        console.warn("audio can't be play");
      });
    }

    return new Audio();
  }

  get id() {
    return this._id;
  }

  get node() {
    return this._node;
  }

  get paused() {
    return this._paused;
  }

  get ended() {
    return this._ended;
  }

  get seek() {
    return this._seek;
  }

  get currentTime() {
    return this._node ? this._node.currentTime : this._seek;
  }

  get muted() {
    return this._muted;
  }

  get volume() {
    return this._volume;
  }

  get sinkId() {
    return this._outputDevice;
  }
}

export { Sound };
