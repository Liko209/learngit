/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-27 14:33:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { MembersItemView } from './MembersItem.View';
import { MembersItemViewModel } from './MembersItem.ViewModel';
import { MembersItemProps } from './types';

const MembersItem = buildContainer<MembersItemProps>({
  View: MembersItemView,
  ViewModel: MembersItemViewModel,
});

export { MembersItem };
