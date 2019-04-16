/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2019-01-10 09:18:47
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCMediaElement } from './types';
import { rtcLogger } from './RTCLoggerProxy';

const LOG_TAG = 'RTCMediaElementManager';
class RTCMediaElementManager {
  private static _singleton: RTCMediaElementManager | null = null;
  private _mediaRootElement: any = null;
  private _volume: number = 1;

  public static instance() {
    if (!RTCMediaElementManager._singleton) {
      RTCMediaElementManager._singleton = new RTCMediaElementManager();
    }
    return RTCMediaElementManager._singleton;
  }

  public destroy() {
    RTCMediaElementManager._singleton = null;
  }

  public setVolume(volume: number) {
    if (volume < 0 || volume > 1) {
      rtcLogger.warn(
        LOG_TAG,
        `Failed to set volume ${volume}. Volume value must be in [0, 1]`,
      );
      return;
    }
    rtcLogger.debug(LOG_TAG, `Set volume: ${volume}`);
    this._volume = volume;
    const audioList = document.querySelectorAll<HTMLVideoElement>(
      '.rc-phone-audio',
    );
    audioList.forEach((element: HTMLVideoElement) => {
      this._setVolumeInVideoElement(element, volume);
    });
  }

  public getVolume(): number {
    return this._volume;
  }

  public createMediaElement(uuid: string): RTCMediaElement | null {
    this._initMediaRoot();
    if (!this._mediaRootElement) {
      return null;
    }
    const local_audio = document.createElement('video');
    local_audio.autoplay = true;
    local_audio.hidden = true;
    local_audio.muted = true;
    local_audio.id = `local-audio-${uuid}`;
    local_audio.className = 'rc-phone-audio';
    local_audio.volume = this._volume;
    this._mediaRootElement.appendChild(local_audio);

    const remote_audio = document.createElement('video');
    remote_audio.autoplay = true;
    remote_audio.hidden = true;
    remote_audio.id = `remote-audio-${uuid}`;
    remote_audio.className = 'rc-phone-audio';
    remote_audio.volume = this._volume;
    this._mediaRootElement.appendChild(remote_audio);

    return { local: local_audio, remote: remote_audio };
  }

  public getMediaElementByCallId(uuid: string): RTCMediaElement | null {
    const local_audio_element = document.getElementById(`local-audio-${uuid}`);
    const remote_audio_element = document.getElementById(
      `remote-audio-${uuid}`,
    );
    if (local_audio_element && remote_audio_element) {
      return { local: local_audio_element, remote: local_audio_element };
    }
    return null;
  }

  public removeMediaElement(uuid: string) {
    if (!this._mediaRootElement) {
      return;
    }
    const local_audio_element = document.getElementById(`local-audio-${uuid}`);
    if (local_audio_element && local_audio_element.parentNode) {
      local_audio_element.parentNode.removeChild(local_audio_element);
    }
    const remote_audio_element = document.getElementById(
      `remote-audio-${uuid}`,
    );
    if (remote_audio_element && remote_audio_element.parentNode) {
      remote_audio_element.parentNode.removeChild(remote_audio_element);
    }
  }

  private _initMediaRoot() {
    const rootEl = document.getElementById('root');
    this._mediaRootElement = document.getElementById('rc_audio_div');
    if (rootEl && !this._mediaRootElement) {
      this._mediaRootElement = document.createElement('div');
      this._mediaRootElement.setAttribute('id', 'rc_audio_div');
      rootEl.appendChild(this._mediaRootElement);
    }
  }

  private _setVolumeInVideoElement(element: HTMLVideoElement, volume: number) {
    element.volume = volume;
  }
}

export { RTCMediaElementManager };
