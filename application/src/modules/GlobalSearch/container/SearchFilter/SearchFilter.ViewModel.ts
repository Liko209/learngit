/*
 * @Author: ken.li
 * @Date: 2019-04-08 13:53:38
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { SearchFilterProps, SearchFilterViewProps } from './types';

class SearchFilterViewModel extends StoreViewModel<SearchFilterProps>
  implements SearchFilterViewProps {}

export { SearchFilterViewModel };
