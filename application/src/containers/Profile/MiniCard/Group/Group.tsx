/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ProfileMiniCardGroupView } from './Group.View';
import { ProfileMiniCardGroupViewModel } from './Group.ViewModel';
import { ProfileMiniCardGroupProps } from './types';

const ProfileMiniCardGroup = buildContainer<ProfileMiniCardGroupProps>({
  View: ProfileMiniCardGroupView,
  ViewModel: ProfileMiniCardGroupViewModel,
});

export { ProfileMiniCardGroup, ProfileMiniCardGroupProps };
