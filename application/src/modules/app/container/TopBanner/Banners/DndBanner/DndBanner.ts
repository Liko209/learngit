/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-23 01:48:27
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { DndBannerView } from './DndBanner.View';
import { DndBannerViewModel } from './DndBanner.ViewModel';
import { DndBannerProps } from './types';

const DndBanner = buildContainer<DndBannerProps>({
  View: DndBannerView,
  ViewModel: DndBannerViewModel,
});

export { DndBanner };
