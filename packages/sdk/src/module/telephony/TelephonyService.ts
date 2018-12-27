/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2018-12-20 10:49:42
 * Copyright © RingCentral. All rights reserved.
 */

import { NETWORK_METHOD, ITelephonyDelegate } from 'foundation';
import Api from '../../api/api';
import BaseService from '../../service/BaseService';
import RTCEngine from 'voip';

class TelephonyService extends BaseService implements ITelephonyDelegate {
  rtcEngine: RTCEngine;

  constructor() {
    super();
    this.rtcEngine = RTCEngine.getInstance();
  }

  /**
   * @override
   */
  async doHttpRequest(
    path: string,
    method: NETWORK_METHOD,
    headers?: object,
    data?: object,
    params?: object,
    retryCount?: number,
  ) {
    return await Api.rcNetworkClient
      .request({
        path,
        method,
        headers,
        data,
        params,
        retryCount,
      })
      .then(response => response.response);
  }
}

export { TelephonyService };
