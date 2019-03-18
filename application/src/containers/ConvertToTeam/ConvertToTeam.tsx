/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-13 09:54:26
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ConvertToTeamView } from './ConvertToTeam.View';
import { ConvertToTeamViewModel } from './ConvertToTeam.ViewModel';
import { ConvertToTeamProps } from './types';
import portalManager from '@/common/PortalManager';

const ConvertToTeamContainer = buildContainer<ConvertToTeamProps>({
  View: ConvertToTeamView,
  ViewModel: ConvertToTeamViewModel,
});

const ConvertToTeam = portalManager.wrapper(ConvertToTeamContainer);

export { ConvertToTeam, ConvertToTeamProps };
