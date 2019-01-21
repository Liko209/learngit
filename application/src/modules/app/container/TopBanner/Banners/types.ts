/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-06 13:21:46
 * Copyright © RingCentral. All rights reserved.
 */

import { JuiSnackbarsType } from 'jui/components/Snackbars';

type NetworkBannerProps = {};

type BannerType = {
  message: string;
  type: JuiSnackbarsType;
};

type NetworkBannerViewProps = {
  banner: BannerType | null;
};

export { NetworkBannerProps, NetworkBannerViewProps, BannerType };
