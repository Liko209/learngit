/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-22 03:47:23
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { AskFirstView } from './AskFirst.View';
import { AskFirstViewModel } from './AskFirst.ViewModel';
import { Props } from './types';

const AskFirst = buildContainer<Props>({
  View: AskFirstView,
  ViewModel: AskFirstViewModel,
});

export { AskFirst, Props };
