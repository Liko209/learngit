/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ProfileDialogPersonView } from './Person.View';
import { ProfileDialogPersonViewModel } from './Person.ViewModel';
import { ProfileDialogPersonProps } from './types';

const ProfileDialogPerson = buildContainer<ProfileDialogPersonProps>({
  View: ProfileDialogPersonView,
  ViewModel: ProfileDialogPersonViewModel,
});

export { ProfileDialogPerson, ProfileDialogPersonProps };
