/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ProfileMiniCardGroupFooterView } from './Footer.View';
import { ProfileMiniCardGroupFooterViewModel } from './Footer.ViewModel';
import { ProfileMiniCardGroupFooterProps } from './types';

const ProfileMiniCardGroupFooter = buildContainer<
  ProfileMiniCardGroupFooterProps
>({
  View: ProfileMiniCardGroupFooterView,
  ViewModel: ProfileMiniCardGroupFooterViewModel,
});

export { ProfileMiniCardGroupFooter, ProfileMiniCardGroupFooterProps };
