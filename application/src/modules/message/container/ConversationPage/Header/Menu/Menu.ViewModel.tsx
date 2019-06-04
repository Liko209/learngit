/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-05-31 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { Group } from 'sdk/module/group/entity';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity, getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import GroupModel from '@/store/models/Group';
import { CONVERSATION_TYPES } from '@/constants';
import { MenuProps } from './types';

class MenuViewModel extends StoreViewModel<MenuProps> {
  @computed
  private get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.id);
  }

  @computed
  get groupType() {
    return this._group.type;
  }

  @computed
  get isAdmin() {
    return this._group.isAdmin;
  }

  @computed
  get isCompanyTeam() {
    return this._group.isCompanyTeam;
  }

  @computed
  get profileId() {
    const membersExcludeMe = this._group.membersExcludeMe;
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);

    switch (this.groupType) {
      case CONVERSATION_TYPES.TEAM:
      case CONVERSATION_TYPES.NORMAL_GROUP:
        return this.props.id;
      case CONVERSATION_TYPES.ME:
        return currentUserId;
      default:
        return membersExcludeMe[0];
    }
  }
}
export { MenuViewModel };
