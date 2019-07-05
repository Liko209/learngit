/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:22:04
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
