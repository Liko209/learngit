/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-09 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { RegionSettingItemView } from './RegionSettingItem.View';
import { RegionSettingItemViewModel } from './RegionSettingItem.ViewModel';
import { RegionSettingItemProps } from './types';

const RegionSettingItem = buildContainer<RegionSettingItemProps>({
  View: RegionSettingItemView,
  ViewModel: RegionSettingItemViewModel,
});

export { RegionSettingItem };
