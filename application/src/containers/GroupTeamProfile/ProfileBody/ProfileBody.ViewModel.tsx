/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed } from 'mobx';
import { ProfileBodyProps } from './types';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { CONVERSATION_TYPES } from '@/constants';

class ProfileBodyViewModel extends StoreViewModel<ProfileBodyProps> {
  @computed
  get id() {
    return this.props.id;
  }
  @computed
  private get _group() {
    return getEntity(ENTITY_NAME.GROUP, this.id);
  }
  @computed
  private get _person() {
    return getEntity(ENTITY_NAME.PERSON, this.id);
  }
  @computed
  private get _profileData() {
    switch (this.props.type) {
      case CONVERSATION_TYPES.NORMAL_GROUP:
      case CONVERSATION_TYPES.TEAM:
        return this._group;
      case CONVERSATION_TYPES.NORMAL_ONE_TO_ONE:
        return this._person;
      default:
        return this._group;
    }
  }
  @computed
  get displayName() {
    return this._profileData && this._profileData.displayName;
  }
  @computed
  get description() {
    return this._profileData && this._profileData.description;
  }
}
export { ProfileBodyViewModel };
