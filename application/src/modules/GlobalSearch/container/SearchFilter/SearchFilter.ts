/*
 * @Author: ken.li
 * @Date: 2019-04-08 13:53:16
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { SearchFilterView } from './SearchFilter.View';
import { SearchFilterViewModel } from './SearchFilter.ViewModel';
import { SearchFilterProps } from './types';

const SearchFilter = buildContainer<SearchFilterProps>({
  View: SearchFilterView,
  ViewModel: SearchFilterViewModel,
});

export { SearchFilter };
