/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 16:34:49
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { StreamView } from './Stream.View';
import { StreamViewModel } from './Stream.ViewModel';
import { StreamProps } from './types';

const Stream = buildContainer<StreamProps>({
  View: StreamView,
  ViewModel: StreamViewModel,
});

export { Stream };
