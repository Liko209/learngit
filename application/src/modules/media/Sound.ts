/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-27 12:40:00
 * Copyright © RingCentral. All rights reserved.
 */
import {
  SoundOptions,
  MediaEventName,
  MediaEventType,
  MediaEvents,
} from '@/interface/media';
import { Utils } from './Utils';
import { mainLogger } from 'foundation/log';

class Sound {
  private _id: SoundOptions['id'];
  private _url: SoundOptions['url'];
  private _muted: SoundOptions['muted'];
  private _volume: SoundOptions['volume'];
  private _loop: SoundOptions['loop'];
  private _autoplay: SoundOptions['autoplay'];
  private _outputDevice: SoundOptions['outputDevice'];
  private _isDeviceSound: SoundOptions['isDeviceSound'];
  private _events: MediaEvents[] = [];
  private _canplayListener: () => void;

  private _duration: number;
  private _paused: boolean;
  private _ended: boolean;
  private _loadError: boolean;
  private _seek: number;
  private _hasSinkId: boolean = false;
  private _holdPlaying: boolean;

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

  setLoop(loop: boolean) {
    this._soundLoop(loop);
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

    if (!opts || (opts && !opts.continuePlay)) {
      this._soundPause();
    }
    this._seek = time;

    if (isPlaying) {
      if (opts && !opts.continuePlay) {
        return;
      }
      this._soundPlay(time);
    } else {
      opts && opts.continuePlay && this._soundPlay(time);
    }
  }

  async dispose() {
    if (this._node) {
      this._node.pause();
      this._node.currentTime = 0;
      this._node.setSinkId && (await this._node.setSinkId(''));

      this._events
        .filter(evt => evt.type === MediaEventType.ON && evt.name === 'error')
        .forEach(event => {
          this.unbindEvent(event.name, event.handler);
        });
      this._node.src = '';

      this._node = null;
      if (process.env.NODE_ENV !== 'test') {
        const audio = document.getElementById(this._id);
        audio && audio.parentNode && audio.parentNode.removeChild(audio);
        mainLogger.log(
          `[MediaModule] [Sound] disposed, mediaId: ${this._id}, mediaUrl: ${
            this._url
          }.`,
        );
      }
    }
    setTimeout(() => {
      this._unbindAllEvents();
      this._resetSound();
    }, 0);
  }

  dispatchEvent(event: Event) {
    if (!this._node) {
      return;
    }
    this._node.dispatchEvent(event);
  }

  bindEvent(
    eventName: MediaEventName,
    handler: (event: Event) => void,
    record: boolean = true,
  ) {
    record &&
      this._events.push({
        handler,
        name: eventName,
        type: MediaEventType.ON,
      });
    this._on(eventName, handler);
  }

  unbindEvent(eventName: MediaEventName, handler: (event: Event) => void) {
    // check event pool has bound same name event
    const hasEvent = this._events.some(evt => evt.name === eventName);
    if (hasEvent) {
      this._events = this._events.filter(
        evt => !(evt.name === eventName && evt.handler === handler),
      );
      this._off(eventName, handler);
    }
  }

  reloadSound() {
    this._node && this._node.load();
  }

  private _setup(options: SoundOptions) {
    this._id = options.id;
    this._url = options.url;
    this._muted = options.muted || false;
    this._volume = Utils.isValidVolume(options.volume) ? options.volume : 1;
    this._loop = options.loop || false;
    this._autoplay = options.autoplay || false;
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

    this._soundEventBind();

    if (this._outputDevice && this._node.setSinkId) {
      const node = this._node;
      // fix bug https://jira.ringcentral.com/browse/FIJI-7786
      setTimeout(() => {
        node
          .setSinkId(this._outputDevice)
          .then(() => {
            this._hasSinkId = true;
            this._holdPlaying && this._soundPlay();
          })
          .catch((e: any) => {
            mainLogger.warn(
              '[MediaModule] audio set sinkId error',
              this._id,
              e.code,
              e.message,
            );
            this._hasSinkId = false;
          });
      }, 0);
    }
    this._node.src = this._url;
    this._node.preload = 'auto';
    this._node.volume = this._volume;
    this._node.muted = this._muted;
    this._node.loop = this._loop;
    this._node.autoplay = this._autoplay;
    this._node.load();
  }

  private _soundPlay(startTime?: number) {
    if (startTime !== undefined && this._node) {
      this._node.currentTime = startTime;
    }

    if (!this._node || !this._paused) {
      return;
    }

    this._loadError && this.reloadSound();

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
              this._loadError = false;
              this._holdPlaying = false;
              if (this._isDeviceSound && !this._hasSinkId) {
                this._soundStop();
                this._holdPlaying = true;
                return;
              }
              mainLogger.log(
                `[MediaModule] [Sound] html5 audio play, mediaId: ${
                  this._id
                }, mediaUrl: ${this._url}.`,
              );
            })
            .catch(e => {
              mainLogger.warn(
                '[MediaModule] audio play catch error',
                this._id,
                e.code,
                e.message,
              );
              if (this._autoplay && e.code === 0) {
                Utils.audioPolicyHandler(() => {
                  this.play();
                });
              }
              this._resetSound();
            });
        }

        const endedListener = () => {
          if (!this._node) {
            return;
          }
          this._resetSound();
          this._node.removeEventListener('ended', endedListener, false);
        };
        this._node.addEventListener('ended', endedListener, false);
      } catch (e) {
        mainLogger.warn(
          '[MediaModule] html5AudioPlay catch error',
          this._id,
          e.code,
          e.message,
        );
      }
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

      this._canplayListener = listener;

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
    if (!this._node) {
      return;
    }
    this._canplayListener &&
      this._node.removeEventListener(
        'canplaythrough',
        this._canplayListener,
        false,
      );
    this._node.pause();
    this._node.currentTime = 0;
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

  private _soundLoop(loop: boolean) {
    if (!this._node) {
      return;
    }
    this._loop = loop;
    this._node.loop = loop;
  }

  private _soundEventBind() {
    if (this._events && this._events.length !== 0) {
      this._events.forEach(event => {
        const { name, type, handler } = event;
        if (type === MediaEventType.ON) {
          this._on(name, handler);
        } else if (MediaEventType.OFF) {
          this._off(name, handler);
        }
      });
    }

    if (this._node) {
      const soundError = () => {
        if (this._node) {
          this._paused = true;
          this._ended = true;
          this._loadError = true;
          this._node.removeEventListener('error', soundError, false);
        }
      };
      const soundCanplay = () => {
        if (this._node) {
          this._duration = Math.ceil(this._node.duration * 10) / 10;
          this._loadError = false;
          this._node.removeEventListener('canplay', soundCanplay, false);
        }
      };

      this._node.addEventListener('error', soundError, false);
      this._node.addEventListener('canplay', soundCanplay, false);
    }
  }

  private _unbindAllEvents() {
    const onEvents = this._events.filter(evt => evt.type === MediaEventType.ON);
    onEvents.forEach(evt => {
      const { name, handler } = evt;
      this.unbindEvent(name, handler);
    });
  }

  private _on(event: MediaEventName, handler: (event: Event) => void) {
    if (!this._node || this._isDeviceSound) {
      return;
    }
    this._node.addEventListener(event, handler, false);
  }

  private _off(event: MediaEventName, handler: (event: Event) => void) {
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
      testPlay.catch((e: any) => {
        mainLogger.warn(
          "[MediaModule] test audio can't be play, please check new Audio can be used",
          this._id,
          e.code,
          e.message,
        );
      });
    }

    const audio = new Audio();
    if (process.env.NODE_ENV !== 'test') {
      audio.id = this._id;
      document.body.appendChild(audio);
      mainLogger.log(
        `[MediaModule] [Sound] html5 audio created, mediaId: ${
          this._id
        }, mediaUrl: ${this._url}.`,
      );
    }
    return audio;
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

  get duration() {
    return this._node ? this._node.duration : this._duration || 0;
  }

  get muted() {
    return this._muted;
  }

  get volume() {
    return this._volume;
  }

  get autoplay() {
    return this._autoplay;
  }

  get loop() {
    return this._loop;
  }

  get sinkId() {
    return this._outputDevice;
  }

  get events() {
    return this._events;
  }
}

export { Sound };
