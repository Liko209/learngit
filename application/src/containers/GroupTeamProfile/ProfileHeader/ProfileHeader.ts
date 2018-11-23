/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { ProfileHeaderView } from './ProfileHeader.View';
import { ProfileHeaderViewModel } from './ProfileHeader.ViewModel';
import { ProfileHeaderViewProps } from './types';

const ProfileHeader = buildContainer<ProfileHeaderViewProps>({
  View: ProfileHeaderView,
  ViewModel: ProfileHeaderViewModel,
});

export { ProfileHeader };
