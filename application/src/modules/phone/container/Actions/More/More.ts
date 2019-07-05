/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:26:02
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { MoreView } from './More.View';
import { MoreViewModel } from './More.ViewModel';
import { MoreProps } from './types';

const More = buildContainer<MoreProps>({
  View: MoreView,
  ViewModel: MoreViewModel,
});

export { More };
