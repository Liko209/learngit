/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-29 10:00:10
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { ConversationInitialPostView } from './ConversationInitialPost.View';
import { ConversationInitialPostViewModel } from './ConversationInitialPost.ViewModel';
import { ConversationInitialPostProps } from './types';

const ConversationInitialPost = buildContainer<ConversationInitialPostProps>({
  ViewModel: ConversationInitialPostViewModel,
  View: ConversationInitialPostView,
});

export { ConversationInitialPost, ConversationInitialPostProps };
