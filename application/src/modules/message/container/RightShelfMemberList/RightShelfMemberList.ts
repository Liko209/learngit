/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-07-26 13:50:42
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { RightShelfMemberListView } from './RightShelfMemberList.View';
import { RightShelfMemberListViewModel } from './RightShelfMemberList.ViewModel';
import { RightShelfMemberListProps } from './types';

const RightShelfMemberList = buildContainer<RightShelfMemberListProps>({
  ViewModel: RightShelfMemberListViewModel,
  View: RightShelfMemberListView,
});

export { RightShelfMemberList, RightShelfMemberListProps };
