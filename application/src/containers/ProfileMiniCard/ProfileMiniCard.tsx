/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ProfileMiniCardView } from './ProfileMiniCard.View';
import { ProfileMiniCardViewModel } from './ProfileMiniCard.ViewModel';
import { ProfileMiniCardProps } from './types';

const ProfileMiniCard = buildContainer<ProfileMiniCardProps>({
  View: ProfileMiniCardView,
  ViewModel: ProfileMiniCardViewModel,
});

export { ProfileMiniCard };
