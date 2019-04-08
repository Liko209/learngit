/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { MessagingView } from './Messaging.View';
import { MessagingViewModel } from './Messaging.ViewModel';
import { MessagingProps } from './types';

const Messaging = buildContainer<MessagingProps>({
  View: MessagingView,
  ViewModel: MessagingViewModel,
});

export { Messaging, MessagingProps };
