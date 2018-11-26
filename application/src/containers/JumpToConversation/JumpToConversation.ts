/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-26 15:22:13
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { JumpToConversationView } from './JumpToConversation.View';
import { JumpToConversationViewModel } from './JumpToConversation.ViewModel';
import { Props } from './types';

const JumpToConversation = buildContainer<Props>({
  View: JumpToConversationView,
  ViewModel: JumpToConversationViewModel,
});

export { JumpToConversation };
