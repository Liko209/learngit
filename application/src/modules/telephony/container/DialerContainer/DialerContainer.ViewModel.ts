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
import { TELEPHONY_SERVICE } from '../../interface/constant';

const sleep = function () {
  return new Promise((resolve: (args: any) => any) => {
    requestAnimationFrame(resolve);
  });
};

class DialerContainerViewModel extends StoreViewModel<DialerContainerProps>
  implements DialerContainerViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  private _audioPool: HTMLMediaElement[] | null;
  private _currentSoundTrack: number | null;
  private _canPlayOgg = false;
  private _frameId?: number;

  constructor(...args: DialerContainerProps[]) {
    super(...args);
    if (typeof document !== 'undefined' && document.createElement) {
      this._audioPool = Array(this._telephonyStore.maximumInputLength)
        .fill(1)
        .map(() => document.createElement('audio'));
      let t: HTMLMediaElement | null = document.createElement('audio');
      this._canPlayOgg = t.canPlayType('audio/ogg') !== '';
      t = null;
      this._currentSoundTrack = 0;
    }
  }

  @computed
  get keypadEntered() {
    return this._telephonyStore.keypadEntered;
  }

  @computed
  get isDialer() {
    return this._telephonyStore.shouldDisplayDialer;
  }

  @computed
  get dialerInputFocused() {
    return this._telephonyStore.dialerInputFocused;
  }

  @computed
  get chosenCallerPhoneNumber() {
    return this._telephonyStore.chosenCallerPhoneNumber;
  }

  @computed
  get callerPhoneNumberList() {
    return this._telephonyStore.callerPhoneNumberList.map((el) => ({
      value: el.phoneNumber,
      usageType: el.usageType,
      phoneNumber: el.phoneNumber,
    }));
  }

  @computed
  get hasDialerOpened() {
    return this._telephonyStore.dialerOpenedCount !== 0;
  }

  @computed
  get canTypeString() {
    return (
      this._telephonyStore.inputString.length <
      this._telephonyStore.maximumInputLength
    );
  }

  @computed
  get dialerFocused() {
    return this._telephonyStore.dialerFocused && this._telephonyStore.keypadEntered;
  }

  /**
   * Perf: since it's a loop around search, we should not block the main thread
   * while searching for the next available <audio/> roundly
   * even if the sounds for each key last actually very short
   */
  async getPlayableSoundTrack(
    cursor = this._currentSoundTrack as number,
  ): Promise<[HTMLMediaElement, number] | null> {
    if (!Array.isArray(this._audioPool)) {
      return null;
    }
    const currentSoundTrack = this._audioPool[cursor];

    // if the current <audio/> is playing, search for the next none
    if (!currentSoundTrack.paused) {
      await sleep();
      return Array.isArray(this._audioPool)
        ? this.getPlayableSoundTrack(
            ((cursor as number) + 1) % this._audioPool.length,
          )
        : null;
    }
    return [currentSoundTrack, cursor];
  }

  private _playAudio = async (value: string) => {
    if (
      this._audioPool &&
      this._canPlayOgg &&
      audios[value] &&
      this._currentSoundTrack !== null
    ) {
      const res = await this.getPlayableSoundTrack();
      if (!Array.isArray(res)) {
        return;
      }
      const [currentSoundTrack, cursor] = res as [HTMLMediaElement, number];
      currentSoundTrack.pause();
      currentSoundTrack.src = audios[value];
      currentSoundTrack.currentTime = 0;
      currentSoundTrack.play();
      this._currentSoundTrack = cursor;
    }
  }

  dtmf = (digit: string) => {
    if (!this._telephonyStore.dialerFocused) {
      return;
    }
    this.playAudio(digit);
    this._telephonyService.dtmf(digit);
  }

  playAudio = (digit: string) => {
    if (!this.canTypeString) {
      return;
    }
    this._playAudio(digit === '+' ? '0' : digit);
  }

  dispose = () => {
    this._audioPool = null;
    this._currentSoundTrack = null;
    if (this._frameId) {
      cancelAnimationFrame(this._frameId);
    }
  }

  typeString = (str: string) => {
    if (!this.canTypeString) {
      return;
    }
    this.playAudio(str);
    this._telephonyService.concatInputString(str);
  }

  setCallerPhoneNumber = (str: string) =>
    this._telephonyService.setCallerPhoneNumber(str)

  onAfterDialerOpen = () => this._telephonyService.onAfterDialerOpen();
}

export { DialerContainerViewModel };
