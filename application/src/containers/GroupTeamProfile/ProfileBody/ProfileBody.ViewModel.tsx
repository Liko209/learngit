/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed } from 'mobx';
import { ProfileBodyProps } from './types';
import { getEntity, getGlobalValue } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { TypeDictionary } from 'sdk/utils';
import { GLOBAL_KEYS } from '@/store/constants';

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
  private get _type() {
    return this.props.type;
  }
  @computed
  private get _profileData() {
    switch (this.props.type) {
      case TypeDictionary.TYPE_ID_GROUP:
      case TypeDictionary.TYPE_ID_TEAM:
        return this._group;
      case TypeDictionary.TYPE_ID_PERSON:
        return this._person;
      default:
        return this._group;
    }
  }
  @computed
  get _displayName() {
    return this._profileData.displayName;
  }
  @computed
  get _userDisplayName() {
    return this._profileData.userDisplayName;
  }
  @computed
  get name() {
    return this._displayName || this._userDisplayName;
  }
  @computed
  get description() {
    return this._profileData.description;
  }
  @computed
  get isShowMessageButton() {
    return getGlobalValue(GLOBAL_KEYS.IS_SHOW_PROFILE_MSG_BUTTON);
  }
  @computed
  get awayStatus() {
    return this._profileData.awayStatus;
  }
  @computed
  get jobTitle() {
    return this._profileData.jobTitle;
  }
  @computed
  get isCurrentUser() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID) === this.id;
  }
  @computed
  get isGroupOrTeam() {
    return this._type === TypeDictionary.TYPE_ID_GROUP ||
      this._type === TypeDictionary.TYPE_ID_TEAM;
  }
  @computed
  get isPerson() {
    return this._type === TypeDictionary.TYPE_ID_PERSON;
  }
  @computed
  get isGroup() {
    return this._type === TypeDictionary.TYPE_ID_GROUP;
  }
}
export { ProfileBodyViewModel };
