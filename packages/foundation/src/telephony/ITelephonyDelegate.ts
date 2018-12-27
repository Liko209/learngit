/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2018-12-20 13:59:18
 * Copyright © RingCentral. All rights reserved.
 */
import { NETWORK_METHOD, BaseResponse } from '../network';

interface ITelephonyDelegate {
  doHttpRequest: (
    path: string,
    method: NETWORK_METHOD,
    headers?: object,
    data?: object,
    params?: object,
    retryCount?: number,
  ) => Promise<BaseResponse>;
}

export { ITelephonyDelegate };
