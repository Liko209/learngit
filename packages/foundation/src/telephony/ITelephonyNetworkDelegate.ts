/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2018-12-20 13:59:18
 * Copyright © RingCentral. All rights reserved.
 */
import { IRequest, IResponse } from '../network';

interface ITelephonyNetworkDelegate {
  doHttpRequest(request: IRequest): Promise<IResponse>;
}

export { ITelephonyNetworkDelegate };
