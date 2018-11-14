/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 17:27:47
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { AvatarNameView } from './AvatarName.View';
import { AvatarNameViewModel } from './AvatarName.ViewModel';
import { Props } from './types';

const AvatarName = buildContainer<Props>({
  View: AvatarNameView,
  ViewModel: AvatarNameViewModel,
});

export { AvatarName, Props };
