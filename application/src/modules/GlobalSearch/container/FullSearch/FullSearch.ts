/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:47:13
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { FullSearchView } from './FullSearch.View';
import { FullSearchViewModel } from './FullSearch.ViewModel';
import { FullSearchProps } from './types';

const FullSearch = buildContainer<FullSearchProps>({
  View: FullSearchView,
  ViewModel: FullSearchViewModel,
});

export { FullSearch };
