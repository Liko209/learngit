/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { MemberHeaderView } from './MemberHeader.View';
import { MemberHeaderViewModel } from './MemberHeader.ViewModel';
import { MemberHeaderProps } from './types';

const MemberHeader = buildContainer<MemberHeaderProps>({
  View: MemberHeaderView,
  ViewModel: MemberHeaderViewModel,
});

export { MemberHeader, MemberHeaderProps };
