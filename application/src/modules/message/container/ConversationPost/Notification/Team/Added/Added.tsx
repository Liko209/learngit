/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-30 18:11:30
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { AddedView } from './Added.View';
import { AddedViewModel } from './Added.ViewModel';
import { AddedProps } from './types';

const Added = buildContainer<AddedProps>({
  View: AddedView,
  ViewModel: AddedViewModel,
});

export { Added };
