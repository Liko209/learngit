/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ProfileView } from './Profile.View';
import { ProfileViewModel } from './Profile.ViewModel';
import { ProfileProps } from './types';

const Profile = buildContainer<ProfileProps>({
  View: ProfileView,
  ViewModel: ProfileViewModel,
});

export { Profile };
