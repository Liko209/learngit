/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-17 16:24:02
 * Copyright © RingCentral. All rights reserved.
 */

import { ENTITY_NAME } from '@/store';
import { getEntity }  from '@/store/utils';
import { observable, action, autorun } from 'mobx';
import PersonModel from '../../store/models/Person';
import { isOnlyLetterOrNumbers } from '@/utils';
import defaultAvatar from './defaultAvatar.svg';
import getAvatarColors from './colors';

class ViewModel {
  constructor() {}
  @observable person: PersonModel;
  @observable uId = 0;
  @action.bound
  public getPersonInfo (uId: number) {
    this.person = getEntity(ENTITY_NAME.PERSON, uId) as PersonModel;
    this.uId = uId;
    autorun(() => {
      this.handleAvatar();
    });
  }
  private _handleUid() {
    const UID = String(this.uId);
    let hash = 0;
    for (const i of UID) {
      hash = hash + Number(i);
    }
    if (hash < 0) {
      hash = -hash;
    }
    return hash % 10;
  }
  private _handleLetter(name: string) {
    return name.slice(0, 1).toUpperCase();
  }
  @action.bound
  public handleAvatar() {
    const { firstName, lastName, headshot } = this.person;
    if (headshot && headshot.url) {
      return {
        url: headshot.url,
      };
    }
    // handle only letter or numbers
    if (isOnlyLetterOrNumbers(firstName) && isOnlyLetterOrNumbers(lastName)) {
      const bgColor = getAvatarColors(this._handleUid());
      const firstLetter = this._handleLetter(firstName!);
      const lastLetter = this._handleLetter(lastName!);
      const abbreviationName = firstLetter + lastLetter;
      return {
        bgColor,
        name: abbreviationName,
      };
    }
    if ((!firstName && lastName) || (firstName && !lastName)) {
      ((firstName, lastName) => {
        const bgColor = getAvatarColors(this._handleUid());
        const names = !!firstName && firstName.split(/\s+/) || !!lastName && lastName.split(/\s+/);
        const firstLetter = this._handleLetter(names[0]);
        const lastLetter = this._handleLetter(names[1]);
        const abbreviationName = firstLetter + lastLetter;
        return {
          bgColor,
          name: abbreviationName,
        };
      })(firstName, lastName);
    }
    return {
      url: defaultAvatar,
    };
  }
}
export default ViewModel;
