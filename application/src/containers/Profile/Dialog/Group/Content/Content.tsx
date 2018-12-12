/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ProfileDialogGroupContentView } from './Content.View';
import { ProfileDialogGroupContentViewModel } from './Content.ViewModel';
import { ProfileDialogGroupContentProps } from './types';

const ProfileDialogGroupContent = buildContainer<
  ProfileDialogGroupContentProps
>({
  View: ProfileDialogGroupContentView,
  ViewModel: ProfileDialogGroupContentViewModel,
});

export { ProfileDialogGroupContent, ProfileDialogGroupContentProps };
