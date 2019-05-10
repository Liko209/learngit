/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-06 13:21:46
 * Copyright © RingCentral. All rights reserved.
 */

import { WithTranslation } from 'react-i18next';

type NetworkBannerProps = {};

type NetworkBannerViewProps = WithTranslation &
  NetworkBannerProps & {
    isShow: boolean;
  };

export { NetworkBannerProps, NetworkBannerViewProps };
