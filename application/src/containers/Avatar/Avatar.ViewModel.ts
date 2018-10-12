/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-17 16:24:02
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { computed } from 'mobx';
import { AvatarViewProps } from './types';
import { AvatarProps } from '@/containers/Avatar/Avatar';

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
  private get _uid() {
    return this.props.uid;
  }

  @computed
  private get _hash() {
    let hash = 0;
    for (const i of `${this._uid}`) {
      hash = hash + String(i).charCodeAt(0);
    }
    if (hash < 0) {
      hash = -hash;
    }
    return hash % 10;
  }

  @computed
  private get _person() {
    return getEntity(ENTITY_NAME.PERSON, this._uid);
  }

  get bgColor() {
    const hash = this._hash;
    return AVATAR_COLORS[hash];
  }

  @computed
  get name() {
    return this._person.shortName;
  }

  @computed
  get url() {
    const { headshot } = this._person;
    if (typeof headshot === 'string') {
      return headshot;
    }
    if (headshot && headshot.url) {
      return headshot.url;
    }
    return '';
  }
}

export { AvatarViewModel };
