/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2018-12-05 10:41:15
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCAccount } from './RTCAccount';
import { IRTCAccountDelegate } from './IRTCAccountDelegate';
import { IRTCLogger } from '../utils/IRTCLogger';
import { rtcLogger } from '../utils/RTCLoggerProxy';

class RTCEngine {
  private static instance: RTCEngine;
  private _mediaRootElement: any;
  private _localAudio: any;
  private _remoteAudio: any;

  constructor() {
    this._initMediaRoot();
  }

  public static getInstance() {
    if (!RTCEngine.instance) {
      RTCEngine.instance = new RTCEngine();
    }
    return RTCEngine.instance;
  }

  public createAccount(delegate: IRTCAccountDelegate): RTCAccount {
    return new RTCAccount(delegate);
  }

  public static setLogger(logger: IRTCLogger): void {
    rtcLogger.setLogger(logger);
  }

  public getLocalAudio(): any {
    return this._localAudio;
  }

  public getRemoteAudio(): any {
    return this._remoteAudio;
  }

  private _initMediaRoot() {
    const rootEl = document.getElementById('root');
    this._mediaRootElement = document.getElementById('rc_audio_div');
    if (rootEl && !this._mediaRootElement) {
      this._mediaRootElement = document.createElement('div');
      this._mediaRootElement.setAttribute('id', 'rc_audio_div');
      rootEl.appendChild(this._mediaRootElement);
    }
    if (!this._mediaRootElement) {
      return;
    }
    const local_audio = document.createElement('video');
    local_audio.hidden = true;
    local_audio.muted = true;
    local_audio.id = 'local-audio-init';
    local_audio.className = 'rc-phone-audio';
    local_audio.volume = 1;
    this._mediaRootElement.appendChild(local_audio);
    this._localAudio = local_audio;

    const remote_audio = document.createElement('video');
    remote_audio.hidden = true;
    remote_audio.id = 'remote-audio-init';
    remote_audio.className = 'rc-phone-audio';
    remote_audio.volume = 1;
    this._mediaRootElement.appendChild(remote_audio);
    this._remoteAudio = remote_audio;
  }
}

export { RTCEngine };
