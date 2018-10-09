/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-29 10:33:36
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { MessagesView } from './Messages.View';
import { MessagesViewModel } from './Messages.ViewModel';

const Messages = buildContainer({
  View: MessagesView,
  ViewModel: MessagesViewModel,
});

export { Messages };
