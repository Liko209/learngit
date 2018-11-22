/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { MembersListView } from './MembersList.View';
import { MembersListViewModel } from './MembersList.ViewModel';

const MembersList = buildContainer({
  View: MembersListView,
  ViewModel: MembersListViewModel,
});

export { MembersList };
