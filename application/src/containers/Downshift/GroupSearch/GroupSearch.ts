/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-18 13:46:56
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { GroupSearchView } from './GroupSearch.View';
import { GroupSearchViewModel } from './GroupSearch.ViewModel';
import { GroupSearchProps } from './types';

const GroupSearch = buildContainer<GroupSearchProps>({
  View: GroupSearchView,
  ViewModel: GroupSearchViewModel,
});

export { GroupSearch };
