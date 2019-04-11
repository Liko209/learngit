/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-04-09 09:53:57
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { GroupSearchItemView } from './GroupSearchItem.View';
import { GroupSearchItemViewModel } from './GroupSearchItem.ViewModel';
import { Props } from './types';

const GroupSearchItem = buildContainer<Props>({
  View: GroupSearchItemView,
  ViewModel: GroupSearchItemViewModel,
});

export { GroupSearchItem, Props };
