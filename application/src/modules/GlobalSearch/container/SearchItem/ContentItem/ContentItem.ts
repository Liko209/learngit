/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:37:42
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { ContentItemView } from './ContentItem.View';
import { ContentItemViewModel } from './ContentItem.ViewModel';

const ContentItem = buildContainer<any>({
  ViewModel: ContentItemViewModel,
  View: ContentItemView,
});

export { ContentItem };
