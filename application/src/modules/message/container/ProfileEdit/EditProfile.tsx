/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-24 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import portalManager from '@/common/PortalManager';
import { EditProfileView } from './EditProfile.View';
import { EditProfileViewModel } from './EditProfile.ViewModel';
import { EditProfileProps } from './types';

const EditProfileContainer = buildContainer<EditProfileProps>({
  View: EditProfileView,
  ViewModel: EditProfileViewModel,
});

const EditProfile = portalManager.wrapper(EditProfileContainer);

export { EditProfile };
