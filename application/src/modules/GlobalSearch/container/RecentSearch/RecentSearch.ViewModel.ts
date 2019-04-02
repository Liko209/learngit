/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:49:32
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { RecentSearchProps, RecentSearchViewProps } from './types';

class RecentSearchViewModel extends StoreViewModel<RecentSearchProps>
  implements RecentSearchViewProps {}

export { RecentSearchViewModel };
