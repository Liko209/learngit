/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
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
