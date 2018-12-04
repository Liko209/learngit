/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { GroupTeamProfileView } from './GroupTeamProfile.View';
import { GroupTeamProfileViewModel } from './GroupTeamProfile.ViewModel';
import { GroupTeamProps } from './types';

const GroupTeamProfile = buildContainer<GroupTeamProps>({
  View: GroupTeamProfileView,
  ViewModel: GroupTeamProfileViewModel,
});

export { GroupTeamProfile };
