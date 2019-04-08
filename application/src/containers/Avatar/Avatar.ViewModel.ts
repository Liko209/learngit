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
import { PersonService } from 'sdk/module/person';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

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
  private get _hash() {
    let hash = 0;
    if (this.props.uid) {
      for (const i of `${this.props.uid}`) {
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
    if (!this.props.uid) return null;
    return getEntity(ENTITY_NAME.PERSON, this.props.uid);
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
      return !this._person.hasHeadShot && !!this._person.shortName;
    }
    return false;
  }

  @computed
  get headShotUrl() {
    if (!(this._person && this._person.hasHeadShot)) {
      return '';
    }
    const { headshotVersion, headshot } = this._person;
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    const url = personService.getHeadShotWithSize(
      this.props.uid,
      headshotVersion,
      headshot,
      150,
    );
    return url || '';
  }
  @computed
  get automationId() {
    return this.props.automationId;
  }
}
export { AvatarViewModel };
