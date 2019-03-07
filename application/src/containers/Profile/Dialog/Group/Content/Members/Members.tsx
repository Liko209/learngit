/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { MembersView } from './Members.View';
import { MembersViewModel } from './Members.ViewModel';
import { MembersProps } from './types';

const Members = buildContainer<MembersProps>({
  View: MembersView,
  ViewModel: MembersViewModel,
});

export { Members, MembersProps };
