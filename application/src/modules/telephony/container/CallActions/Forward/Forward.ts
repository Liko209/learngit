/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-05-29 09:31:47
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ForwardView } from './Forward.View';
import { ForwardViewModel } from './Forward.ViewModel';
import { Props } from './types';

const Forward = buildContainer<Props>({
  View: ForwardView,
  ViewModel: ForwardViewModel,
});

export { Forward, Props };
