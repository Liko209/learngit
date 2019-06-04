/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:51:43
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { SelectSettingItemView } from './SelectSettingItem.View';
import { SelectSettingItemViewModel } from './SelectSettingItem.ViewModel';
import { SelectSettingItemProps } from './types';

const SelectSettingItem = buildContainer<SelectSettingItemProps>({
  View: SelectSettingItemView,
  ViewModel: SelectSettingItemViewModel,
});

export { SelectSettingItem, SelectSettingItemProps };
