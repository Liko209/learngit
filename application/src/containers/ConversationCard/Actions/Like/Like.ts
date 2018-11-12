/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { LikeView } from './Like.View';
import { LikeViewModel } from './Like.ViewModel';
import { LikeProps } from './types';

const Like = buildContainer<LikeProps>({
  View: LikeView,
  ViewModel: LikeViewModel,
});

export { Like };
