/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 17:06:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { ProfileButtonView } from './Profile.View';
import { ProfileViewModel } from './Profile.ViewModel';
import { ProfileButtonProps } from './types';

const Profile = buildContainer<ProfileButtonProps>({
  View: ProfileButtonView,
  ViewModel: ProfileViewModel,
});

export { Profile };
