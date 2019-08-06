/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-07-25 10:00:13
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { SwitchCallBannerView } from './SwitchCallBanner.View';
import { SwitchCallBannerViewModel } from './SwitchCallBanner.ViewModel';
import { Props } from './types';

const SwitchCallBanner = buildContainer<Props>({
  View: SwitchCallBannerView,
  ViewModel: SwitchCallBannerViewModel,
});

export { SwitchCallBanner, Props };
