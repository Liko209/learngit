/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-30 15:37:35
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ElectronUpgradeBannerView } from './ElectronUpgradeBanner.View';
import { ElectronUpgradeBannerViewModel } from './ElectronUpgradeBanner.ViewModel';
import { ElectronUpgradeBannerProps } from './types';

const ElectronUpgradeBanner = buildContainer<ElectronUpgradeBannerProps>({
  ViewModel: ElectronUpgradeBannerViewModel,
  View: ElectronUpgradeBannerView,
});

export { ElectronUpgradeBanner, ElectronUpgradeBannerProps };
