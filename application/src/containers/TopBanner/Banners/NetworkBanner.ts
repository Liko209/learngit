/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-05 10:08:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { NetworkBannerView } from './NetworkBanner.View';
import { NetworkBannerViewModel } from './NetworkBanner.ViewModel';
import { NetworkBannerProps } from './types';

const NetworkBanner = buildContainer<NetworkBannerProps>({
  ViewModel: NetworkBannerViewModel,
  View: NetworkBannerView,
});

export { NetworkBanner, NetworkBannerProps };
