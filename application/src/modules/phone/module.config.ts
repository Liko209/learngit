/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-04 16:12:23
 * Copyright © RingCentral. All rights reserved.
 */
import { PhoneModule } from './PhoneModule';
import { PhoneService } from './service';
import { PHONE_SERVICE } from './interface/constant';
const config = {
  entry: PhoneModule,
  provides: [{ name: PHONE_SERVICE, value: PhoneService }],
};

export { config };
