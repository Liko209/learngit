/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:51:43
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { SliderSettingItemView } from './SliderSettingItem.View';
import { SliderSettingItemViewModel } from './SliderSettingItem.ViewModel';
import { SliderSettingItemProps } from './types';

const SliderSettingItem = buildContainer<SliderSettingItemProps>({
  View: SliderSettingItemView,
  ViewModel: SliderSettingItemViewModel,
});

export { SliderSettingItem, SliderSettingItemProps };
