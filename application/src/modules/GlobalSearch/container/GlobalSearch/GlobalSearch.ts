/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:47:13
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { GlobalSearchView } from './GlobalSearch.View';
import { GlobalSearchViewModel } from './GlobalSearch.ViewModel';
import { GlobalSearchProps } from './types';

const GlobalSearch = buildContainer<GlobalSearchProps>({
  View: GlobalSearchView,
  ViewModel: GlobalSearchViewModel,
});

export { GlobalSearch };
