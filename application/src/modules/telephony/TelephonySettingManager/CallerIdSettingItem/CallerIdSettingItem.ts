/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-08 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { CallerIdSettingItemView } from './CallerIdSettingItem.View';
import { CallerIdSettingItemViewModel } from './CallerIdSettingItem.ViewModel';

const CallerIdSettingItem = buildContainer({
  View: CallerIdSettingItemView,
  ViewModel: CallerIdSettingItemViewModel,
});

export { CallerIdSettingItem };
