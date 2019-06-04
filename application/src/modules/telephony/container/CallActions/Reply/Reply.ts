/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-05-27 16:13:35
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ReplyView } from './Reply.View';
import { ReplyViewModel } from './Reply.ViewModel';
import { Props } from './types';

const Reply = buildContainer<Props>({
  View: ReplyView,
  ViewModel: ReplyViewModel,
});

export { Reply, Props };
