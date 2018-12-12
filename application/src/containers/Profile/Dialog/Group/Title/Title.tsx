/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ProfileDialogGroupTitleView } from './Title.View';
import { ProfileDialogGroupViewModel } from '../Group.ViewModel';
import { ProfileDialogGroupTitleProps } from './types';

const ProfileDialogGroupTitle = buildContainer<ProfileDialogGroupTitleProps>({
  View: ProfileDialogGroupTitleView,
  ViewModel: ProfileDialogGroupViewModel,
});

export { ProfileDialogGroupTitle, ProfileDialogGroupTitleProps };
