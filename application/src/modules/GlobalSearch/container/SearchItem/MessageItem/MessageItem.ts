/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:37:42
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { MessageItemView } from './MessageItem.View';
import { MessageItemViewModel } from './MessageItem.ViewModel';

const MessageItem = buildContainer<any>({
  ViewModel: MessageItemViewModel,
  View: MessageItemView,
});

export { MessageItem };
