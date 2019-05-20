/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-09 15:33:13
 * Copyright © RingCentral. All rights reserved.
 */

import { ConfigChangeHistory } from './types';
import { Nullable } from 'sdk/types';

interface IConfigHistory {
  getHistoryDetail: () => Nullable<ConfigChangeHistory>;
}

export { IConfigHistory };
