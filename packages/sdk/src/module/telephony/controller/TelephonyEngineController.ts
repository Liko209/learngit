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
import { RTCEngine } from 'voip';
import { Api } from '../../../api';
import { TelephonyAccountController } from './TelephonyAccountController';
import { ITelephonyAccountDelegate } from '../service/ITelephonyAccountDelegate';
import { TelephonyUserConfig } from '../config/TelephonyUserConfig';
import { ITelephonyCallDelegate } from '../service';
import { TelephonyLogController } from './TelephonyLogController';

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
  private _telephonyConfig: TelephonyUserConfig;

  constructor() {
    this._telephonyConfig = new TelephonyUserConfig();
  }
  put(key: string, value: any): void {
    this._telephonyConfig.putConfig(key, value);
  }

  get(key: string): any {
    return this._telephonyConfig.getConfig(key);
  }

  remove(key: string): void {
    this._telephonyConfig.removeConfig(key);
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
    RTCEngine.setLogger(new TelephonyLogController());
    this.rtcEngine = RTCEngine.getInstance();
    this.rtcEngine.setNetworkDelegate(this.voipNetworkDelegate);
    this.rtcEngine.setTelephonyDaoDelegate(this.voipDaoDelegate);
  }

  createAccount(
    accountDelegate: ITelephonyAccountDelegate,
    callDelegate: ITelephonyCallDelegate,
  ) {
    // Engine can hold multiple accounts for multiple calls
    this._accountController = new TelephonyAccountController(
      this.rtcEngine,
      accountDelegate,
      callDelegate,
    );
  }

  getAccountController() {
    return this._accountController;
  }

  logout() {
    this._accountController.logout();
  }
}

export { TelephonyEngineController };
