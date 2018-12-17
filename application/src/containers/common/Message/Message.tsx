/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { MessageView } from './Message.View';
import { MessageViewModel } from './Message.ViewModel';
import { MessageProps } from './types';

const Message = buildContainer<MessageProps>({
  View: MessageView,
  ViewModel: MessageViewModel,
});

export { Message };
