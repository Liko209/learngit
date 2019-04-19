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
  private _audioPool: HTMLMediaElement[] | null;
  private _nextAvailableSoundTrack: number | null;
  private _canPlayOgg = false;
  private _frameId?: number;

  constructor(...args: DialerContainerProps[]) {
    super(...args);
    if (typeof document !== 'undefined' && document.createElement) {
      this._audioPool = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map((i) =>
        document.createElement('audio'),
      );
      let t: HTMLMediaElement | null = document.createElement('audio');
      this._canPlayOgg = t.canPlayType('audio/ogg') !== '';
      t = null;
      this._nextAvailableSoundTrack = 0;
    }
  }

  @computed
  get keypadEntered() {
    return this._telephonyStore.keypadEntered;
  }

  private _playAudio = (value: string) => {
    if (
      this._audioPool &&
      this._canPlayOgg &&
      audios[value] &&
      this._nextAvailableSoundTrack !== null
    ) {
      const soundTrack = this._audioPool[this._nextAvailableSoundTrack];
      if (!soundTrack.paused) {
        soundTrack.pause();
      }
      soundTrack.src = audios[value];
      soundTrack.currentTime = 0;
      soundTrack.play();
      this._nextAvailableSoundTrack =
        ((this._nextAvailableSoundTrack as number) + 1) %
        this._audioPool.length;
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
    this._audioPool = null;
    this._nextAvailableSoundTrack = null;
    if (this._frameId) {
      cancelAnimationFrame(this._frameId);
    }
  }
}

export { DialerContainerViewModel };
