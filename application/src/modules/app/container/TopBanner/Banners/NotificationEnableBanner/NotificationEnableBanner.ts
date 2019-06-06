/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-27 14:21:24
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { NotificationEnableBannerView } from './NotificationEnableBanner.View';
import { NotificationEnableBannerViewModel } from './NotificationEnableBanner.ViewModel';
import { NotificationEnableBannerProps } from './types';

const NotificationEnableBanner = buildContainer<NotificationEnableBannerProps>({
  ViewModel: NotificationEnableBannerViewModel,
  View: NotificationEnableBannerView,
});

export { NotificationEnableBanner, NotificationEnableBannerProps };
