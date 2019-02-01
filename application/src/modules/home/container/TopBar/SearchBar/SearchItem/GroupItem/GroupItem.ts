/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:37:42
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { GroupItemView } from './GroupItem.View';
import { GroupItemViewModel } from './GroupItem.ViewModel';

const GroupItem = buildContainer<any>({
  ViewModel: GroupItemViewModel,
  View: GroupItemView,
});

export { GroupItem };
