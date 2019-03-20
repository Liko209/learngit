/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-13 09:54:26
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { GroupSettingsView } from './GroupSettings.View';
import { GroupSettingsViewModel } from './GroupSettings.ViewModel';
import { GroupSettingsProps } from './types';
import portalManager from '@/common/PortalManager';

const GroupSettingsContainer = buildContainer<GroupSettingsProps>({
  View: GroupSettingsView,
  ViewModel: GroupSettingsViewModel,
});

const GroupSettings = portalManager.wrapper(GroupSettingsContainer);

export { GroupSettings, GroupSettingsProps };
