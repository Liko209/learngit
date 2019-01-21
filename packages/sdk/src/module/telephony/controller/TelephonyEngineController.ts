/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2018-12-28 17:06:18
 * Copyright © RingCentral. All rights reserved.
 */
import {
  ITelephonyNetworkDelegate,
  IRequest,
  ITelephonyDBDelegate,
} from 'foundation';
import RTCEngine from 'voip';
import { Api } from '../../../api';
import { daoManager, VoIPDao } from '../../../dao';
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

class VoIPDBClient implements ITelephonyDBDelegate {
  put(key: string, value: any): void {
    const voipDao = daoManager.getKVDao(VoIPDao);
    voipDao.put(key, value);
    return;
  }

  get(key: string): any {
    const voipDao = daoManager.getKVDao(VoIPDao);
    return voipDao.get(key);
  }

  remove(key: string): void {
    const voipDao = daoManager.getKVDao(VoIPDao);
    voipDao.remove(key);
  }
}

class TelephonyEngineController {
  rtcEngine: RTCEngine;
  voipNetworkDelegate: VoIPNetworkClient;
  voipDBDelegate: VoIPDBClient;

  constructor() {
    this.voipNetworkDelegate = new VoIPNetworkClient();
    this.voipDBDelegate = new VoIPDBClient();
  }

  initEngine() {
    this.rtcEngine = RTCEngine.getInstance();
    this.rtcEngine.setNetworkDelegate(this.voipNetworkDelegate);
    this.rtcEngine.setDBDelegate(this.voipDBDelegate);
  }
}

export { TelephonyEngineController };
