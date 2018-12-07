/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-27 14:33:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { MemberListItemView } from './MemberListItem.View';
import { MemberListItemViewModel } from './MemberListItem.ViewModel';
import { MemberListItemProps } from './types';

const MemberListItem = buildContainer<MemberListItemProps>({
  View: MemberListItemView,
  ViewModel: MemberListItemViewModel,
});

export { MemberListItem, MemberListItemProps };
