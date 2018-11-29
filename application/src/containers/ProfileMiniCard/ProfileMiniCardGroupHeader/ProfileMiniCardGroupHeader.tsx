/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ProfileMiniCardGroupHeaderView } from './ProfileMiniCardGroupHeader.View';
import { ProfileMiniCardGroupHeaderViewModel } from './ProfileMiniCardGroupHeader.ViewModel';
import { ProfileMiniCardGroupHeaderProps } from './types';

const ProfileMiniCardGroupHeader = buildContainer<
  ProfileMiniCardGroupHeaderProps
>({
  View: ProfileMiniCardGroupHeaderView,
  ViewModel: ProfileMiniCardGroupHeaderViewModel,
});

export { ProfileMiniCardGroupHeader };
