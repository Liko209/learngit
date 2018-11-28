/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ProfileMiniCardPersonHeaderView } from './ProfileMiniCardPersonHeader.View';
import { ProfileMiniCardPersonHeaderViewModel } from './ProfileMiniCardPersonHeader.ViewModel';
import { ProfileMiniCardPersonHeaderProps } from './types';

const ProfileMiniCardPersonHeader = buildContainer<
  ProfileMiniCardPersonHeaderProps
>({
  View: ProfileMiniCardPersonHeaderView,
  ViewModel: ProfileMiniCardPersonHeaderViewModel,
});

export { ProfileMiniCardPersonHeader };
