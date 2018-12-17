/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 17:06:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { ProfileButtonView } from './ProfileButton.View';
import { ProfileButtonViewModel } from './ProfileButton.ViewModel';
import { ProfileButtonProps } from './types';

const ProfileButton = buildContainer<ProfileButtonProps>({
  View: ProfileButtonView,
  ViewModel: ProfileButtonViewModel,
});

export { ProfileButton };
