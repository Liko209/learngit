/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2018-12-28 17:06:18
 * Copyright © RingCentral. All rights reserved.
 */
import { ITelephonyNetworkDelegate, IRequest } from 'foundation';
import { Api } from '../../../api';
import { IControllerBuilder } from '../../../framework/controller/interface/IControllerBuilder';
import RTCEngine from 'voip/src';

class VoIPNetworkClient implements ITelephonyNetworkDelegate {
  async doHttpRequest(request: IRequest) {
    return await Api.rcNetworkClient
      .request({
        via: request.via,
        path: request.path,
        method: request.method,
        data: request.data as Object,
        headers: request.headers,
        params: request.params,
        authFree: request.authFree,
        retryCount: request.retryCount,
        requestConfig: request.requestConfig,
      })
      .then(response => response.response);
  }
}

class TelephonyController {
  rtcEngine: RTCEngine;
  voipNetworkDelegate: VoIPNetworkClient;

  constructor(public controllerBuilder: IControllerBuilder) {
    this.voipNetworkDelegate = new VoIPNetworkClient();
  }

  initEngine() {
    this.rtcEngine = RTCEngine.getInstance();
  }
}

export { TelephonyController };
