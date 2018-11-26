/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 17:02:02
 * Copyright © RingCentral. All rights reserved.
 */
import { action } from 'mobx';
import { AbstractViewModel } from '@/base';

// import { getEntity } from '@/store/utils';
// import GroupModel from '@/store/models/Group';
// import { Group } from 'sdk/models';
// import storeManager, { ENTITY_NAME } from '@/store';
import { ProfileButtonProps } from './types';
// const globalStore = storeManager.getGlobalStore();
class ProfileViewModel extends AbstractViewModel<ProfileButtonProps> {
  // @computed
  // get id() {
  //   return this.props.id;
  // }
  @action
  handleGlobalGroupId = () => {
    // globalStore.set(GLOBAL_KEYS.GROUP_OR_TEAM_ID, this.groupId);
  }
}

export { ProfileViewModel };
