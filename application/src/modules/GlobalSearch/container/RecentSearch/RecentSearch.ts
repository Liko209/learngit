/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:47:13
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { RecentSearchView } from './RecentSearch.View';
import { RecentSearchViewModel } from './RecentSearch.ViewModel';
import { RecentSearchProps } from './types';

const RecentSearch = buildContainer<RecentSearchProps>({
  View: RecentSearchView,
  ViewModel: RecentSearchViewModel,
});

export { RecentSearch };
