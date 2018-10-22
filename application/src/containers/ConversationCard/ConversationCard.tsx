/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-08 16:24:15
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { ConversationCardView } from './ConversationCard.View';
import { ConversationCardViewModel } from './ConversationCard.ViewModel';

const ConversationCard = buildContainer<{ id: number }>({
  View: ConversationCardView,
  ViewModel: ConversationCardViewModel,
});

export { ConversationCard };
