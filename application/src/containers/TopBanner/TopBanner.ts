/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-04 15:57:44
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { TopBannerView } from './TopBanner.View';
import { TopBannerViewModel } from './TopBanner.ViewModel';

const TopBanner = buildContainer({
  ViewModel: TopBannerViewModel,
  View: TopBannerView,
});

export { TopBanner };
