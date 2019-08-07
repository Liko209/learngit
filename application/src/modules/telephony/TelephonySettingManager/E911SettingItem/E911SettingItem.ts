/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-23 09:57:39
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { E911SettingItemView } from "./E911SettingItem.View";
import { E911SettingItemViewModel } from "./E911SettingItem.ViewModel";
import { E911SettingItemProps } from './types';

const E911SettingItem = buildContainer<E911SettingItemProps>({
  View: E911SettingItemView,
  ViewModel: E911SettingItemViewModel,
});

export { E911SettingItem };
