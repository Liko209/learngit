/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, computed } from 'mobx';
import { container } from 'framework';
import { TelephonyService } from '../../service';
import { TelephonyStore } from '../../store';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import PersonModel from '@/store/models/Person';
import {
  Person,
  PhoneNumberInfo,
  PHONE_NUMBER_TYPE,
} from 'sdk/module/person/entity';
import { IncomingProps, IncomingViewProps } from './types';

const ringTone = require('./sounds/Ringtone.mp3');

class IncomingViewModel extends StoreViewModel<IncomingProps>
  implements IncomingViewProps {
  private _telephonyService: TelephonyService = container.get(TelephonyService);
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  private _audio: HTMLAudioElement | null;
  private _frameId?: number;

  @computed
  get phone() {
    return this._telephonyStore.phoneNumber;
  }

  @computed
  get name() {
    if (this._person) {
      return this._person.userDisplayName;
    }
    return '';
  }

  @computed
  get isExt() {
    if (this._person) {
      return this._person.phoneNumbers.some((info: PhoneNumberInfo) => {
        if (
          info.type === PHONE_NUMBER_TYPE.EXTENSION_NUMBER &&
          info.phoneNumber === this._telephonyStore.phoneNumber
        ) {
          return true;
        }
        return false;
      });
    }

    return true;
  }

  @observable
  uid?: number;

  constructor(props: IncomingProps) {
    super(props);
    if (typeof document !== 'undefined' && document.createElement) {
      this._audio = document.createElement('audio');
      this._audio.loop = true;
    }
    this.reaction(
      () => this._telephonyStore.phoneNumber,
      async (phoneNumber: string) => {
        const contact = await this._telephonyService.matchContactByPhoneNumber(
          phoneNumber,
        );
        if (contact) {
          this.uid = contact.id;
        }
      },
      { fireImmediately: true },
    );
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

  @computed
  private get _person() {
    if (!this.uid) return null;
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, this.uid);
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
