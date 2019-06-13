/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2018-12-28 17:06:18
 * Copyright © RingCentral. All rights reserved.
 */
import {
  ITelephonyNetworkDelegate,
  IRequest,
  ITelephonyDaoDelegate,
  telephonyLogger,
} from 'foundation';
import { RTCEngine } from 'voip';
import { Api } from '../../../api';
import { TelephonyAccountController } from './TelephonyAccountController';
import { ITelephonyAccountDelegate } from '../service/ITelephonyAccountDelegate';
import { TelephonyUserConfig } from '../config/TelephonyUserConfig';
import { TelephonyLogController } from './TelephonyLogController';
import { notificationCenter } from '../../../service';
import { RC_INFO, SERVICE } from '../../../service/eventKey';
import { RCInfoService } from '../../rcInfo';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { PermissionService, UserPermissionType } from '../../permission';
import { ENTITY } from 'sdk/service/eventKey';
import { PlatformUtils } from 'sdk/utils/PlatformUtils';
import { AccountService } from 'sdk/module/account';
import { IEntityCacheController } from 'sdk/framework/controller/interface/IEntityCacheController';
import { Call } from '../entity';
import _ from 'lodash';
import { VoIPMediaDevicesDelegate } from './mediaDeviceDelegate/VoIPMediaDevicesDelegate';

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
  constructor(private _telephonyConfig: TelephonyUserConfig) {}
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
  mediaDevicesController: VoIPMediaDevicesDelegate;
  private _accountController: TelephonyAccountController;
  private _preCallingPermission: boolean = false;
  private _accountDelegate: ITelephonyAccountDelegate;
  private _entityCacheController: IEntityCacheController<Call>;

  constructor(
    telephonyConfig: TelephonyUserConfig,
    entityCacheController: IEntityCacheController<Call>,
  ) {
    this.voipNetworkDelegate = new VoIPNetworkClient();
    this.voipDaoDelegate = new VoIPDaoClient(telephonyConfig);
    this._entityCacheController = entityCacheController;
    this.subscribeNotifications();
  }

  async getVoipCallPermission() {
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    const permissionService = ServiceLoader.getInstance<PermissionService>(
      ServiceConfig.PERMISSION_SERVICE,
    );

    const voipCalling =
      (await rcInfoService.isVoipCallingAvailable()) &&
      (await permissionService.hasPermission(
        UserPermissionType.JUPITER_CAN_USE_TELEPHONY,
      ));
    return voipCalling;
  }

  onPermissionUpdated = async () => {
    const currentCallingPermission = await this.getVoipCallPermission();
    telephonyLogger.debug(
      `onPermissionUpdated voipCalling: ${currentCallingPermission} ${
        this._preCallingPermission
      }`,
    );
    if (currentCallingPermission === this._preCallingPermission) {
      telephonyLogger.debug('No permission change');
      return;
    }
    if (currentCallingPermission) {
      this._preCallingPermission = true;
      notificationCenter.emitKVChange(
        SERVICE.TELEPHONY_SERVICE.VOIP_CALLING,
        true,
      );
    } else {
      telephonyLogger.info('voip calling permission is revoked');
      this.logout();
    }
  }

  subscribeNotifications() {
    notificationCenter.on(ENTITY.USER_PERMISSION, () => {
      this.onPermissionUpdated();
    });
    notificationCenter.on(RC_INFO.EXTENSION_INFO, () => {
      this.onPermissionUpdated();
    });
  }

  getEndpointId() {
    const authConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).authUserConfig;
    const rcToken = authConfig.getRCToken();
    return rcToken.endpoint_id;
  }

  initEngine() {
    RTCEngine.setLogger(new TelephonyLogController());
    this.rtcEngine = RTCEngine.getInstance();
    this.mediaDevicesController = new VoIPMediaDevicesDelegate(this.rtcEngine);
    this.rtcEngine.setNetworkDelegate(this.voipNetworkDelegate);
    this.rtcEngine.setTelephonyDaoDelegate(this.voipDaoDelegate);
    this.rtcEngine.setMediaDeviceDelegate(this.mediaDevicesController);
  }

  setAccountDelegate(delegate: ITelephonyAccountDelegate) {
    this._accountDelegate = delegate;
    this._accountController &&
      this._accountController.setAccountDelegate(delegate);
  }

  async createAccount() {
    // Engine can hold multiple accounts for multiple calls
    this._preCallingPermission = await this.getVoipCallPermission();
    this.rtcEngine.setUserInfo({
      endpointId: this.getEndpointId(),
      userAgent: PlatformUtils.getRCUserAgent(),
    });
    if (this._preCallingPermission) {
      this._accountController = new TelephonyAccountController(this.rtcEngine);
      this._accountDelegate &&
        this._accountController.setAccountDelegate(this._accountDelegate);
      this._entityCacheController &&
        this._accountController.setDependentController(
          this._entityCacheController,
        );
    }
  }

  async getUserInfo() {
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    const rcBrandId = await rcInfoService.getRCBrandId();
    const rcAccountId = await rcInfoService.getRCAccountId();
    const rcExtensionId = await rcInfoService.getRCExtensionId();
    return {
      rcBrandId,
      rcAccountId,
      rcExtensionId,
      endpointId: this.getEndpointId(),
      userAgent: PlatformUtils.getRCUserAgent(),
    };
  }

  getAccountController() {
    return this._accountController;
  }

  logout() {
    if (this._accountController) {
      this._accountController.logout(() => {
        this._preCallingPermission = false;
        notificationCenter.emitKVChange(
          SERVICE.TELEPHONY_SERVICE.VOIP_CALLING,
          false,
        );
      });
    }
  }
}

export { TelephonyEngineController };
