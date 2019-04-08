/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 10:29:39
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
