/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { GroupTeamProfileView } from './GroupTeamProfile.View';
import { GroupTeamProfileViewModel } from './GroupTeamProfile.ViewModel';

const GroupTeamProfile = buildContainer({
  View: GroupTeamProfileView,
  ViewModel: GroupTeamProfileViewModel,
});

export { GroupTeamProfile };
