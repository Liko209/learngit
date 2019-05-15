/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-08 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ExtensionsView } from './Extensions.View';
import { ExtensionsViewModel } from './Extensions.ViewModel';

const ExtensionsSettingItem = buildContainer({
  View: ExtensionsView,
  ViewModel: ExtensionsViewModel,
});

export { ExtensionsSettingItem };
