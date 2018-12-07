/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ProfileDialogPersonContentView } from './Content.View';
import { ProfileDialogPersonViewModel } from '../ProfileDialogPerson.ViewModel';
import { ProfileDialogPersonContentProps } from './types';

const ProfileDialogPersonContent = buildContainer<
  ProfileDialogPersonContentProps
>({
  View: ProfileDialogPersonContentView,
  ViewModel: ProfileDialogPersonViewModel,
});

export { ProfileDialogPersonContent, ProfileDialogPersonContentProps };
