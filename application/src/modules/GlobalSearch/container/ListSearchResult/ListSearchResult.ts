/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-03 10:14:06
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ListSearchResultView } from './ListSearchResult.View';
import { ListSearchResultViewModel } from './ListSearchResult.ViewModel';
import { ListSearchResultProps } from './types';

const ListSearchResult = buildContainer<ListSearchResultProps>({
  View: ListSearchResultView,
  ViewModel: ListSearchResultViewModel,
});

export { ListSearchResult };
