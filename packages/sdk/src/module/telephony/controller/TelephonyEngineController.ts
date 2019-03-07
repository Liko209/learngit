/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2018-12-28 17:06:18
 * Copyright © RingCentral. All rights reserved.
 */
import {
  ITelephonyNetworkDelegate,
  IRequest,
  ITelephonyDaoDelegate,
} from 'foundation';
import RTCEngine from 'voip';
import { Api } from '../../../api';
import { daoManager, VoIPDao } from '../../../dao';
import { TelephonyAccountController } from './TelephonyAccountController';
import { ITelephonyAccountDelegate } from '../service/ITelephonyAccountDelegate';

class VoIPNetworkClient implements ITelephonyNetworkDelegate {
  async doHttpRequest(request: IRequest) {
    return await Api.rcNetworkClient.rawRequest({
      via: request.via,
      path: request.path,
      method: request.method,
      data: request.data as Object,
      headers: request.headers,
      params: request.params,
      authFree: request.authFree,
      retryCount: request.retryCount,
      requestConfig: request.requestConfig,
    });
  }
}

class VoIPDaoClient implements ITelephonyDaoDelegate {
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
  voipDaoDelegate: VoIPDaoClient;
  private _accountController: TelephonyAccountController;

  constructor() {
    this.voipNetworkDelegate = new VoIPNetworkClient();
    this.voipDaoDelegate = new VoIPDaoClient();
  }

  initEngine() {
    this.rtcEngine = RTCEngine.getInstance();
    this.rtcEngine.setNetworkDelegate(this.voipNetworkDelegate);
    this.rtcEngine.setTelephonyDaoDelegate(this.voipDaoDelegate);
  }

  createAccount(delegate: ITelephonyAccountDelegate) {
    // Engine can hold multiple accounts for multiple calls
    this._accountController = new TelephonyAccountController(
      this.rtcEngine,
      delegate,
    );
  }

  getAccountController() {
    return this._accountController;
  }
}

export { TelephonyEngineController };
