/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ProfileDialogGroupView } from './Group.View';
import { ProfileDialogGroupViewModel } from './Group.ViewModel';
import { ProfileDialogGroupProps } from './types';

const ProfileDialogGroup = buildContainer<ProfileDialogGroupProps>({
  View: ProfileDialogGroupView,
  ViewModel: ProfileDialogGroupViewModel,
});

export { ProfileDialogGroup, ProfileDialogGroupProps };
