/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-01 23:14:05
 * Copyright © RingCentral. All rights reserved.
 */

import { TelephonyModule } from './TelephonyModule';
import { TelephonyStore } from './store';

const config = {
  entry: TelephonyModule,
  provides: { TelephonyStore },
};

export { config };
