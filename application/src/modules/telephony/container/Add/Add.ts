/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { AddView } from './Add.View';
import { AddViewModel } from './Add.ViewModel';
import { AddProps } from './types';

const Add = buildContainer<AddProps>({
  View: AddView,
  ViewModel: AddViewModel,
});

export { Add };
