/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ProfileMiniCardPersonFooterView } from './Footer.View';
import { ProfileMiniCardPersonViewModel } from '../Person.ViewModel';
import { ProfileMiniCardPersonFooterProps } from './types';

const ProfileMiniCardPersonFooter = buildContainer<
  ProfileMiniCardPersonFooterProps
>({
  View: ProfileMiniCardPersonFooterView,
  ViewModel: ProfileMiniCardPersonViewModel,
});

export { ProfileMiniCardPersonFooter, ProfileMiniCardPersonFooterProps };
