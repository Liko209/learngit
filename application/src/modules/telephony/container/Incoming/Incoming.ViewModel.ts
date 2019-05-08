/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { container } from 'framework';
import { TelephonyStore } from '../../store';
import { StoreViewModel } from '@/store/ViewModel';
import { IncomingProps, IncomingViewProps } from './types';

const ringTone = require('./sounds/Ringtone.mp3');

class IncomingViewModel extends StoreViewModel<IncomingProps>
  implements IncomingViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  private _audio: HTMLAudioElement | null;
  private _frameId?: number;

  @computed
  get phone() {
    return this._telephonyStore.phoneNumber;
  }

  @computed
  get name() {
    return this._telephonyStore.displayName;
  }

  @computed
  get uid() {
    return this._telephonyStore.uid;
  }
  @computed
  get isExt() {
    return this._telephonyStore.isExt;
  }

  constructor(props: IncomingProps) {
    super(props);
    if (typeof document !== 'undefined' && document.createElement) {
      this._audio = document.createElement('audio');
      this._audio.loop = true;
    }
    this._frameId = requestAnimationFrame(() => {
      this._playAudio();
      delete this._frameId;
    });
  }

  private _playAudio = () => {
    if (this._audio && this._audio.canPlayType('audio/mp3') !== '') {
      this._pauseAudio();
      this._audio.src = ringTone;
      this._audio.currentTime = 0;
      this._audio.play();
    }
  }

  private _pauseAudio = () => {
    if (this._audio && !this._audio.paused) {
      this._audio.pause();
    }
  }

  dispose = () => {
    if (this._audio) {
      this._pauseAudio();
      this._audio = null;
    }
    if (this._frameId) {
      cancelAnimationFrame(this._frameId);
    }
  }
}

export { IncomingViewModel };
