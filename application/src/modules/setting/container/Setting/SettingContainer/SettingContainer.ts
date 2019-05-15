/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { SettingContainerView } from './SettingContainer.View';
import { SettingContainerViewModel } from './SettingContainer.ViewModel';
import { SettingContainerProps } from './types';

const SettingContainer = buildContainer<SettingContainerProps>({
  View: SettingContainerView,
  ViewModel: SettingContainerViewModel,
});

export { SettingContainer, SettingContainerProps };
