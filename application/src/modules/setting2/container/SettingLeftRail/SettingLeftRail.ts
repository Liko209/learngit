/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:51:43
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { SettingLeftRailView } from './SettingLeftRail.View';
import { SettingLeftRailViewModel } from './SettingLeftRail.ViewModel';
import { SettingLeftRailProps } from './types';

const SettingLeftRail = buildContainer<SettingLeftRailProps>({
  View: SettingLeftRailView,
  ViewModel: SettingLeftRailViewModel,
});

export { SettingLeftRail, SettingLeftRailProps };
