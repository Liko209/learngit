/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-18 9:20:21
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { AvatarView } from './Avatar.View';
import { AvatarViewModel } from './Avatar.ViewModel';
import { AvatarProps } from './types';

const Avatar = buildContainer<AvatarProps>({
  ViewModel: AvatarViewModel,
  View: AvatarView,
});

export { Avatar };
