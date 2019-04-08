/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-18 13:53:25
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { MentionItemView } from './MentionItem.View';
import { MentionItemViewModel } from './MentionItem.ViewModel';
import { MentionItemProps } from './types';

const MentionItem = buildContainer<MentionItemProps>({
  View: MentionItemView,
  ViewModel: MentionItemViewModel,
});

export { MentionItem };
