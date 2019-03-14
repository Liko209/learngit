/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-03-11 16:25:35,
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { MemberView } from './Member.View';
import { MemberViewModel } from './Member.ViewModel';
import { MemberProps } from './types';

const Member = buildContainer<MemberProps>({
  View: MemberView,
  ViewModel: MemberViewModel,
});

export { Member };
