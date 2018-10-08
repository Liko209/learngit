/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:07:02
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ConversationPageView } from './ConversationPage.View';
import { ConversationPageViewModel } from './ConversationPage.ViewModel';
import { ConversationPageProps } from './types';

const ConversationPage = buildContainer<ConversationPageProps>({
  View: ConversationPageView,
  ViewModel: ConversationPageViewModel,
});

export { ConversationPage };
