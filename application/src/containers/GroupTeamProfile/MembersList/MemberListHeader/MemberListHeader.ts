/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { MemberListHeaderView } from './MemberListHeader.View';
import { MemberListHeaderViewModel } from './MemberListHeader.ViewModel';
import { MemberListHeaderProps } from './types';

const MemberListHeader = buildContainer<MemberListHeaderProps>({
  View: MemberListHeaderView,
  ViewModel: MemberListHeaderViewModel,
});

export { MemberListHeader };
