/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:49:32
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { InstantSearchProps, InstantSearchViewProps } from './types';

class InstantSearchViewModel extends StoreViewModel<InstantSearchProps>
  implements InstantSearchViewProps {}

export { InstantSearchViewModel };
