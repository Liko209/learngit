/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ProfileMiniCardPersonView } from './Person.View';
import { ProfileMiniCardPersonViewModel } from './Person.ViewModel';
import { ProfileMiniCardPersonProps } from './types';

const ProfileMiniCardPerson = buildContainer<ProfileMiniCardPersonProps>({
  View: ProfileMiniCardPersonView,
  ViewModel: ProfileMiniCardPersonViewModel,
});

export { ProfileMiniCardPerson, ProfileMiniCardPersonProps };
