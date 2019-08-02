/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-07-19 13:28:30
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import portalManager from '@/common/PortalManager';
import { NewConversationView } from './NewConversation.View';
import { NewConversationViewModel } from './NewConversation.ViewModel';

const NewConversationContainer = buildContainer({
  View: NewConversationView,
  ViewModel: NewConversationViewModel,
});

const NewConversation = portalManager.wrapper(NewConversationContainer);

export { NewConversation };
