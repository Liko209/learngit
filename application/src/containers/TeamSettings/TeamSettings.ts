/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-15 16:12:28
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import portalManager from '@/common/PortalManager';
import { TeamSettingsView } from './TeamSettings.View';
import { TeamSettingsViewModel } from './TeamSettings.ViewModel';

const TeamSettingsContainer = buildContainer({
  View: TeamSettingsView,
  ViewModel: TeamSettingsViewModel,
});

const TeamSettings = portalManager.wrapper(TeamSettingsContainer);

export { TeamSettings };
