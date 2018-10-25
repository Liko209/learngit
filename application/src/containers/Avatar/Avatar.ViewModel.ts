/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-17 16:24:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { AvatarProps, AvatarViewProps } from './types';
import { PersonService } from 'sdk/service';
import defaultAvatar from './defaultAvatar.svg';

const AVATAR_COLORS = [
  'tomato',
  'blueberry',
  'oasis',
  'gold',
  'sage',
  'ash',
  'persimmon',
  'pear',
  'brass',
  'lake',
];
class AvatarViewModel extends StoreViewModel<AvatarProps>
  implements AvatarViewProps {
  @computed
  get uid() {
    return this.props.uid;
  }
  @computed
  get size() {
    return this.props.size;
  }
  @computed
  get presence() {
    return this.props.presence;
  }
  @computed
  get onClick() {
    return this.props.onClick;
  }

  @computed
  private get _hash() {
    let hash = 0;
    if (this.uid) {
      for (const i of `${this.uid}`) {
        hash = hash + String(i).charCodeAt(0);
      }
    }
    if (hash < 0) {
      hash = -hash;
    }
    return hash % 10;
  }

  @computed
  private get _person() {
    if (!this.uid) return null;
    return getEntity(ENTITY_NAME.PERSON, this.uid);
  }
  @computed
  get bgColor() {
    const hash = this._hash;
    return AVATAR_COLORS[hash];
  }

  @computed
  get shortName() {
    return this._person && this._person.shortName;
  }

  @computed
  get shouldShowShortName() {
    if (this._person) {
      return !this._person.hasHeadShot && this._person.shortName;
    }
    return false;
  }

  @computed
  get headShotUrl() {
    if (!(this._person && this._person.hasHeadShot)) {
      return defaultAvatar;
    }
    let url: string | null = null;
    const { headShotVersion, headshot } = this._person;
    if (headShotVersion) {
      const personService = PersonService.getInstance<PersonService>();
      url = personService.getHeadShot(this.uid, headShotVersion, 150);
    } else if (headshot) {
      if (typeof headshot === 'string') {
        url = headshot;
      }
      if (headshot.url) {
        url = headshot.url;
      } else if (headshot.thumbs) {
        const keys = Object.keys(headshot.thumbs);
        const str = keys.find(url => url.includes('size=150'));
        url = str && headshot.thumbs[str];
      }
    }
    return url;
  }
  @computed
  get autoMationId() {
    return this.props.autoMationId;
  }
}
export { AvatarViewModel };
