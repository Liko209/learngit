/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:51
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { NotificationView } from './Notification.View';
import { NotificationViewModel } from './Notification.ViewModel';
import { NotificationProps } from './types';

const Notification = buildContainer<NotificationProps>({
  View: NotificationView,
  ViewModel: NotificationViewModel,
});

export { Notification };
