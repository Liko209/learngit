/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-22 16:20:34
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
