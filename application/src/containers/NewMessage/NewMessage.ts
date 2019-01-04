/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-22 09:56:00
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import portalManager from '@/common/PortalManager';
import { NewMessageView } from './NewMessage.View';
import { NewMessageViewModel } from './NewMessage.ViewModel';

const NewMessageContainer = buildContainer({
  View: NewMessageView,
  ViewModel: NewMessageViewModel,
});

const NewMessage = portalManager.wrapper(NewMessageContainer);

export { NewMessage };
