/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { getGlobalValue } from '@/store/utils';
import { computed } from 'mobx';
import { GroupTeamProps } from './types';
import { GLOBAL_KEYS } from '@/store/constants';

class GroupTeamProfileViewModel extends StoreViewModel<GroupTeamProps> {
  @computed
  get id() {
    return getGlobalValue(GLOBAL_KEYS.GROUP_OR_TEAM_ID);
  }
}
export { GroupTeamProfileViewModel };
