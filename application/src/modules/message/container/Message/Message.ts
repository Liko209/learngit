/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-29 10:33:36
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { MessageView } from './Message.View';
import { MessageViewModel } from './Message.ViewModel';

const Message = buildContainer({
  View: MessageView,
  ViewModel: MessageViewModel,
});

export { Message };
