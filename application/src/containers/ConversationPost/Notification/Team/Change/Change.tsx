/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-30 18:11:30
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ChangeView } from './Change.View';
import { ChangeViewModel } from './Change.ViewModel';
import { ChangeProps } from './types';

const Change = buildContainer<ChangeProps>({
  View: ChangeView,
  ViewModel: ChangeViewModel,
});

export { Change };
