/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ProfileMiniCardPersonHeaderView } from './Header.View';
import { ProfileMiniCardPersonViewModel } from '../Person.ViewModel';
import { ProfileMiniCardPersonHeaderProps } from './types';

const ProfileMiniCardPersonHeader = buildContainer<
  ProfileMiniCardPersonHeaderProps
>({
  View: ProfileMiniCardPersonHeaderView,
  ViewModel: ProfileMiniCardPersonViewModel,
});

export { ProfileMiniCardPersonHeader, ProfileMiniCardPersonHeaderProps };
