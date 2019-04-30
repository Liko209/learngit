/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { MemberListView } from './MemberList.View';
import { MemberListViewModel } from './MemberList.ViewModel';
import { MemberListProps } from './types';

const MemberList = buildContainer<MemberListProps>({
  View: MemberListView,
  ViewModel: MemberListViewModel,
});

export { MemberList, MemberListProps };
