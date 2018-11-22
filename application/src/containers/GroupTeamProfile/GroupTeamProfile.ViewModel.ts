/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity, getGlobalValue } from '@/store/utils';
import { computed } from 'mobx';
import { GroupTeamProps } from './types';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import GroupModel from '@/store/models/Group';

class GroupTeamProfileViewModel extends StoreViewModel<GroupTeamProps> {
  @computed
  private get _id() {
    // console.log('_id', getGlobalValue(GLOBAL_KEYS.GROUP_OR_TEAM_ID));
    return getGlobalValue(GLOBAL_KEYS.GROUP_OR_TEAM_ID);
  }
  @computed
  get groupModel() {
    return this._id && getEntity(ENTITY_NAME.GROUP, this._id) as GroupModel;
  }
  @computed
  get displayName() {
    return this.groupModel && this.groupModel.displayName;
  }
  @computed
  get description() {
    return this.groupModel && this.groupModel.description;
  }
}
export { GroupTeamProfileViewModel };
