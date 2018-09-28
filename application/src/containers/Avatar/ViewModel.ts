/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-17 16:24:02
 * Copyright © RingCentral. All rights reserved.
 */

import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { observable, autorun, computed } from 'mobx';
import PersonModel from '../../store/models/Person';
import { isOnlyLetterOrNumbers } from '@/utils';
import defaultAvatar from './defaultAvatar.svg';

const AVATAR_COLORS = ['tomato', 'blueberry', 'oasis', 'gold', 'sage', 'ash', 'persimmon', 'pear', 'brass', 'lake'];
class AvatarViewModel {
  @observable
  person: PersonModel;
  @observable
  uId = 0;
  @observable
  hash = 0;
  constructor(uid: number) {
    this.uId = uid;
    const UID = String(this.uId);
    let hash = 0;
    for (const i of UID) {
      hash = hash + String(i).charCodeAt(0);
    }
    if (hash < 0) {
      hash = - hash;
    }
    this.hash = hash % 10;
    autorun(() => {
      this.person = getEntity(ENTITY_NAME.PERSON, this.uId) as PersonModel;
    });
  }
  private _handleLetter(name: string | undefined) {
    return (name && name.slice(0, 1).toUpperCase()) || '';
  }
  private _handleOnlyLetterOrNumbers() {
    const { firstName = '', lastName = '' } = this.person || {};
    const hash = this.hash;
    const bgColor = AVATAR_COLORS[hash];
    const firstLetter = this._handleLetter(firstName!);
    const lastLetter = this._handleLetter(lastName!);
    const abbreviationName = firstLetter + lastLetter;
    return {
      bgColor,
      name: abbreviationName,
    };
  }
  private _handleOneOfName() {
    const { firstName = '', lastName = '' } = this.person || {};
    const hash = this.hash;
    const bgColor = AVATAR_COLORS[hash];
    const names =
      (!!firstName && firstName!.split(/\s+/)) ||
      (!!lastName && lastName!.split(/\s+/));
    const firstLetter = this._handleLetter(names[0]);
    const lastLetter = this._handleLetter(names[1]);
    const abbreviationName = firstLetter + lastLetter;
    return {
      bgColor,
      name: abbreviationName,
    };
  }
  @computed
  get AvatarInfo() {
    const { firstName = '', lastName = '', headshot = '' } = this.person || {};
    if (headshot && headshot.url) {
      return {
        url: headshot.url,
      };
    }
    // handle only letter or numbers
    if (isOnlyLetterOrNumbers(firstName) && isOnlyLetterOrNumbers(lastName)) {
      return this._handleOnlyLetterOrNumbers();
    }
    if ((!firstName && lastName) || (firstName && !lastName)) {
      return this._handleOneOfName();
    }
    return {
      url: defaultAvatar,
    };
  }
}
export default AvatarViewModel;
