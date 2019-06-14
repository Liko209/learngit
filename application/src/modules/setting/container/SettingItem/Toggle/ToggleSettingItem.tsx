/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:51:43
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ToggleSettingItemView } from './ToggleSettingItem.View';
import { ToggleSettingItemViewModel } from './ToggleSettingItem.ViewModel';
import { ToggleSettingItemProps } from './types';

const ToggleSettingItem = buildContainer<ToggleSettingItemProps>({
  View: ToggleSettingItemView,
  ViewModel: ToggleSettingItemViewModel,
});

export { ToggleSettingItem, ToggleSettingItemProps };
