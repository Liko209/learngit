/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:51:43
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { SettingSectionView } from './SettingSection.View';
import { SettingSectionViewModel } from './SettingSection.ViewModel';
import { SettingSectionProps } from './types';

const SettingSection = buildContainer<SettingSectionProps>({
  View: SettingSectionView,
  ViewModel: SettingSectionViewModel,
});

export { SettingSection, SettingSectionProps };
