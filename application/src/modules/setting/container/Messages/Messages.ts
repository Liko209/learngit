/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { MessagesView } from './Messages.View';
import { MessagesViewModel } from './Messages.ViewModel';
import { MessagesProps } from './types';

const Messages = buildContainer<MessagesProps>({
  View: MessagesView,
  ViewModel: MessagesViewModel,
});

export { Messages, MessagesProps };
