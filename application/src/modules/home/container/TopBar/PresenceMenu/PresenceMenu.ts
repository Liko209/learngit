/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-15 06:29:46
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { PresenceMenuView } from './PresenceMenu.View';
import { PresenceMenuViewModel } from './PresenceMenu.ViewModel';
import { PresenceMenuProps } from './types';

const PresenceMenu = buildContainer<PresenceMenuProps>({
  View: PresenceMenuView,
  ViewModel: PresenceMenuViewModel,
});

export { PresenceMenu };
