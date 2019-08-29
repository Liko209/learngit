/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-14 17:55:23
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import portalManager from '@/common/PortalManager';
import { NotificationPreferencesView } from './NotificationPreferences.View';
import { NotificationPreferencesViewModel } from './NotificationPreferences.ViewModel';

const NotificationPreferencesContainer = buildContainer({
  View: NotificationPreferencesView,
  ViewModel: NotificationPreferencesViewModel,
});

const NotificationPreferences = portalManager.wrapper(
  NotificationPreferencesContainer,
);

export { NotificationPreferences };
