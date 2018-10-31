/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { TextMessageView } from './TextMessage.View';
import { TextMessageViewModel } from './TextMessage.ViewModel';
import { TextMessageProps } from './types';

const TextMessage = buildContainer<TextMessageProps>({
  ViewModel: TextMessageViewModel,
  View: TextMessageView,
});

export { TextMessage };
