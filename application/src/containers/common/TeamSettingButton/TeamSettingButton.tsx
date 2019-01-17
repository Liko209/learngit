/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-16 09:24:52
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { TeamSettingButtonView } from './TeamSettingButton.View';
import { TeamSettingButtonViewModel } from './TeamSettingButton.ViewModel';
import { TeamSettingButtonProps } from './types';

const TeamSettingButton = buildContainer<TeamSettingButtonProps>({
  View: TeamSettingButtonView,
  ViewModel: TeamSettingButtonViewModel,
});

export { TeamSettingButton };
