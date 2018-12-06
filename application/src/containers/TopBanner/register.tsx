/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-06 13:21:58
 * Copyright © RingCentral. All rights reserved.
 */

import { NetworkBanner } from './Banners';
/**
 * NetworkBanner priority is [1-100]
 * others should be [101 - ]
 */

type ConfigType = {
  Component: React.ComponentType;
  priority: number;
};

const config: ConfigType[] = [
  {
    priority: 100,
    Component: NetworkBanner,
  },
];

export { config, ConfigType };
