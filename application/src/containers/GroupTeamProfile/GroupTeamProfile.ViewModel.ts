/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { getGlobalValue, getEntity } from '@/store/utils';
import { computed } from 'mobx';
import { GroupTeamProps } from './types';
import { GLOBAL_KEYS } from '@/store/constants';
import { ENTITY_NAME } from '@/store';
import GroupModel from '@/store/models/Group';

class GroupTeamProfileViewModel extends StoreViewModel<GroupTeamProps> {
  @computed
  get id() {
    return getGlobalValue(GLOBAL_KEYS.GROUP_OR_TEAM_ID);
  }
  @computed
  private get _group() {
    return getEntity(ENTITY_NAME.GROUP, this.id) as GroupModel;
  }
  @computed
  get type() {
    return this._group.type;
  }
}
export { GroupTeamProfileViewModel };
