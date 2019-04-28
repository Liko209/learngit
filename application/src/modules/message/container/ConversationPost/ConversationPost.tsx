/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:40
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ConversationPostView } from './ConversationPost.View';
import { ConversationPostViewModel } from './ConversationPost.ViewModel';
import { ConversationPostProps } from './types';

const ConversationPost = buildContainer<ConversationPostProps>({
  View: ConversationPostView,
  ViewModel: ConversationPostViewModel,
});

export { ConversationPost };
