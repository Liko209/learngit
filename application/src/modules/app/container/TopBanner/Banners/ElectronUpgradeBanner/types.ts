/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-30 15:39:28
 * Copyright © RingCentral. All rights reserved.
 */

import { WithTranslation } from 'react-i18next';

type ElectronUpgradeBannerProps = {
  downloadUrl: string;
};

type ElectronUpgradeBannerViewProps = WithTranslation &
  ElectronUpgradeBannerProps & {};

export { ElectronUpgradeBannerProps, ElectronUpgradeBannerViewProps };
