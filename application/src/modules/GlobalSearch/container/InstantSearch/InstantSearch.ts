/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:47:13
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { InstantSearchView } from './InstantSearch.View';
import { InstantSearchViewModel } from './InstantSearch.ViewModel';
import { InstantSearchProps } from './types';

const InstantSearch = buildContainer<InstantSearchProps>({
  View: InstantSearchView,
  ViewModel: InstantSearchViewModel,
});

export { InstantSearch };
