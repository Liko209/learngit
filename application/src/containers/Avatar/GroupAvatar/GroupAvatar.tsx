/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { GroupAvatarView } from './GroupAvatar.View';
import { GroupAvatarViewModel } from './GroupAvatar.ViewModel';
import { GroupAvatarProps } from './types';

const GroupAvatar = buildContainer<GroupAvatarProps>({
  View: GroupAvatarView,
  ViewModel: GroupAvatarViewModel,
});

export { GroupAvatar };
