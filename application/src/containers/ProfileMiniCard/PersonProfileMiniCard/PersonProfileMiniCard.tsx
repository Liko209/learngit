/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { PersonProfileMiniCardView } from './PersonProfileMiniCard.View';
import { PersonProfileMiniCardViewModel } from './PersonProfileMiniCard.ViewModel';
import { PersonProfileMiniCardProps } from './types';

const PersonProfileMiniCard = buildContainer<PersonProfileMiniCardProps>({
  View: PersonProfileMiniCardView,
  ViewModel: PersonProfileMiniCardViewModel,
});

export { PersonProfileMiniCard };
