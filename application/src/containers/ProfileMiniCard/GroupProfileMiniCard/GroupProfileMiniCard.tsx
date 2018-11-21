/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { GroupProfileMiniCardView } from './GroupProfileMiniCard.View';
import { GroupProfileMiniCardViewModel } from './GroupProfileMiniCard.ViewModel';
import { GroupProfileMiniCardProps } from './types';

const GroupProfileMiniCard = buildContainer<GroupProfileMiniCardProps>({
  View: GroupProfileMiniCardView,
  ViewModel: GroupProfileMiniCardViewModel,
});

export { GroupProfileMiniCard };
