/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-07 13:49:24
 * Copyright © RingCentral. All rights reserved.
 */

import { CONFIG_TYPE } from '../../module/config/constants';

type ConfigKey = {
  type: CONFIG_TYPE;
  value: string;
};

type ConfigMove = {
  from: ConfigKey;
  to: ConfigKey;
};

type ConfigChange = {
  move?: ConfigMove[];
  delete?: ConfigKey[];
};

type ConfigChangeHistory = {
  version: number;
  moduleName: string;
  changes: { [version: number]: ConfigChange };
};

export { ConfigKey, ConfigMove, ConfigChangeHistory };
