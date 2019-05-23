/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-19 15:04:30
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { ConversationListItemView } from './ConversationListItem.View';
import { ConversationListItemViewModel } from './ConversationListItem.ViewModel';
import { ConversationListItemProps } from './types';

const ConversationListItem = buildContainer<ConversationListItemProps>({
  ViewModel: ConversationListItemViewModel,
  View: ConversationListItemView,
});

export { ConversationListItem, ConversationListItemProps };
