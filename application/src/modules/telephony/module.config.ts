/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-04 16:12:23
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyModule } from './TelephonyModule';
import { TelephonyService } from './service';

const config = {
  entry: TelephonyModule,
  provides: { TelephonyService },
};

export { config };
