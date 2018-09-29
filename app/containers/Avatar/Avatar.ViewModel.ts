/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-17 16:24:02
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractViewModel } from '@/base';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { observable, autorun, computed } from 'mobx';
import { isOnlyLetterOrNumbers } from '@/utils';
import PersonModel from '../../store/models/Person';
import defaultAvatar from './defaultAvatar.svg';
import { AvatarProps, AvatarViewProps } from './types';

const AVATAR_COLORS = ['tomato', 'blueberry', 'oasis', 'gold', 'sage', 'ash', 'persimmon', 'pear', 'brass', 'lake'];
class AvatarViewModel extends AbstractViewModel implements AvatarViewProps{
  @observable
  person: PersonModel;
  @observable
  uId = 0;
  @observable
  hash = 0;
  constructor({ uid }: AvatarProps) {
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
  @computed
  get avatarInfo() {
    const { firstName = '', lastName = '', headshot = '' } = this.person || {};
    const hash = this.hash;
    const bgColor = AVATAR_COLORS[hash];
    const pm = PersonModel.fromJS({
      id: this.uId,
    });
    if (headshot && headshot.url) {
      return {
        url: headshot.url,
      };
    }
    // handle only letter or numbers
    if (isOnlyLetterOrNumbers(firstName) && isOnlyLetterOrNumbers(lastName)) {
      return {
        bgColor,
        name: pm.shortName,
      };
    }
    if ((!firstName && lastName) || (firstName && !lastName)) {
      return {
        bgColor,
        name: pm.shortName,
      };
    }
    return {
      url: defaultAvatar,
    };
  }
}
export { AvatarViewModel };
