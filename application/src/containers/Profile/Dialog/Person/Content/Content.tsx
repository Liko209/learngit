/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ProfileDialogPersonContentView } from './Content.View';
import { ProfileDialogPersonContentViewModel } from './Content.ViewModel';
import { ProfileDialogPersonContentProps } from './types';

const ProfileDialogPersonContent = buildContainer<
  ProfileDialogPersonContentProps
>({
  View: ProfileDialogPersonContentView,
  ViewModel: ProfileDialogPersonContentViewModel,
});

export { ProfileDialogPersonContent, ProfileDialogPersonContentProps };
