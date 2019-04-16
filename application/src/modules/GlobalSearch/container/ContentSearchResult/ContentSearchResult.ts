/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-02 16:31:35
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ContentSearchResultView } from './ContentSearchResult.View';
import { ContentSearchResultViewModel } from './ContentSearchResult.ViewModel';
import { ContentSearchResultProps } from './types';

const ContentSearchResult = buildContainer<ContentSearchResultProps>({
  View: ContentSearchResultView,
  ViewModel: ContentSearchResultViewModel,
});

export { ContentSearchResult };
