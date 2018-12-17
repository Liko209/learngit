/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { ProfileBodyProps } from './types';
import { getEntity, getGlobalValue } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { TypeDictionary } from 'sdk/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { GroupTeamMembersViewModel } from '../GroupTeamMembers.ViewModel';

class ProfileGroupBodyViewModel extends GroupTeamMembersViewModel {
  constructor(props: ProfileBodyProps) {
    super(props);
  }
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
  get _type() {
    return this.props.type;
  }
  @computed
  get _profileData() {
    switch (this._type) {
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
    if (this._type !== TypeDictionary.TYPE_ID_PERSON) {
      const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
      return this.allMemberIds.indexOf(currentUserId) > -1;
    }
    return true;
  }
}
export { ProfileGroupBodyViewModel };
