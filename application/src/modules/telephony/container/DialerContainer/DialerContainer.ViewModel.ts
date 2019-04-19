/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 16:31:49
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { DialerContainerProps, DialerContainerViewProps } from './types';
import { container } from 'framework';
import { computed } from 'mobx';
import { TelephonyStore } from '../../store';
import { TelephonyService } from '../../service';
import audios from './sounds/sounds.json';

class DialerContainerViewModel extends StoreViewModel<DialerContainerProps>
  implements DialerContainerViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  private _telephonyService: TelephonyService = container.get(TelephonyService);
  private _audio: HTMLAudioElement | null;
  private _frameId?: number;

  constructor(...args: DialerContainerProps[]) {
    super(...args);
    if (typeof document !== 'undefined' && document.createElement) {
      this._audio = document.createElement('audio');
    }
  }

  @computed
  get keypadEntered() {
    return this._telephonyStore.keypadEntered;
  }

  private _playAudio = (value: string) => {
    if (this._audio && this._audio.canPlayType('audio/ogg') !== '' && audios[value]) {
      if (!this._audio.paused) {
        this._audio.pause();
      }
      this._audio.src = audios[value];
      this._audio.currentTime = 0;
      this._audio.play();
    }
  }

  dtmf = (digit: string) => {
    this._telephonyService.dtmf(digit);
    this._frameId = requestAnimationFrame(() => {
      this._playAudio(digit);
      delete this._frameId;
    });
  }

  dispose = () => {
    this._audio = null;
    if (this._frameId) {
      cancelAnimationFrame(this._frameId);
    }
  }
}

export { DialerContainerViewModel };
