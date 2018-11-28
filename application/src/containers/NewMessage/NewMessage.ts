/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-22 09:56:00
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { NewMessageView } from './NewMessage.View';
import { NewMessageViewModel } from './NewMessage.ViewModel';

const NewMessage = buildContainer({
  View: NewMessageView,
  ViewModel: NewMessageViewModel,
});

export { NewMessage };
