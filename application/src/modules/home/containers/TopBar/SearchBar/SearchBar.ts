/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:26:21
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { SearchBarView } from './SearchBar.View';
import { SearchBarViewModel } from './SearchBar.ViewModel';

const SearchBar = buildContainer({
  ViewModel: SearchBarViewModel,
  View: SearchBarView,
});

export { SearchBar };
