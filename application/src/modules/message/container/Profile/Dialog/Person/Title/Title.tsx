/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ProfileDialogPersonTitleView } from './Title.View';
import { ProfileDialogPersonViewModel } from '../Person.ViewModel';
import { ProfileDialogPersonTitleProps } from './types';

const ProfileDialogPersonTitle = buildContainer<ProfileDialogPersonTitleProps>({
  View: ProfileDialogPersonTitleView,
  ViewModel: ProfileDialogPersonViewModel,
});

export { ProfileDialogPersonTitle, ProfileDialogPersonTitleProps };
