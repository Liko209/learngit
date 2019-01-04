/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-30 10:53:17
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import portalManager from '@/common/PortalManager';
import { CreateTeamView } from './CreateTeam.View';
import { CreateTeamViewModel } from './CreateTeam.ViewModel';

const CreateTeamContainer = buildContainer({
  View: CreateTeamView,
  ViewModel: CreateTeamViewModel,
});

const CreateTeam = portalManager.wrapper(CreateTeamContainer);

export { CreateTeam };
