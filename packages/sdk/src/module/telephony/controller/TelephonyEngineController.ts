/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2018-12-28 17:06:18
 * Copyright © RingCentral. All rights reserved.
 */
import {
  ITelephonyNetworkDelegate,
  ITelephonyDaoDelegate,
} from 'foundation/telephony';
import { telephonyLogger } from 'foundation/log';
import { IRequest } from 'foundation/network';
import { RTCEngine, RTCSipEmergencyServiceAddr } from 'voip';
import { Api } from '../../../api';
import { TelephonyAccountController } from './TelephonyAccountController';
import { ITelephonyDelegate } from 'sdk/module/telephony';
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
import { VoIPMediaDevicesDelegate } from './mediaDeviceDelegate/VoIPMediaDevicesDelegate';
import { notificationCallback } from '../types';
import { TelephonyGlobalConfig } from '../config/TelephonyGlobalConfig';
import { IPersonService } from 'sdk/module/person/service/IPersonService';
import { IPhoneNumberService } from 'sdk/module/phoneNumber/service/IPhoneNumberService';
import { IRCInfoService } from 'sdk/module/rcInfo/service/IRCInfoService';

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
  private _accountDelegate: ITelephonyDelegate;
  private _entityCacheController: IEntityCacheController<Call>;

  constructor(
    telephonyConfig: TelephonyUserConfig,
    entityCacheController: IEntityCacheController<Call>,
    private _personService: IPersonService,
    private _phoneNumberService: IPhoneNumberService,
    private _rcInfoService: IRCInfoService,
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
      this.createAccount();
      notificationCenter.emitKVChange(
        SERVICE.TELEPHONY_SERVICE.VOIP_CALLING,
        true,
      );
    } else {
      telephonyLogger.info('voip calling permission is revoked');
      this.logout();
    }
  };

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

  setAccountDelegate(delegate: ITelephonyDelegate) {
    this._accountDelegate = delegate;
    this._accountController &&
      this._accountController.setAccountDelegate(delegate);
  }

  async createAccount() {
    // Engine can hold multiple accounts for multiple calls
    this._preCallingPermission = await this.getVoipCallPermission();
    this.rtcEngine.setUserInfo(await this.getUserInfo());
    if (this._preCallingPermission) {
      this._accountController = new TelephonyAccountController(
        this.rtcEngine,
        this._personService,
        this._phoneNumberService,
        this._rcInfoService,
      );
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
        delete this._accountController;
      });
    }
  }

  getRingerDevicesList() {
    return this.mediaDevicesController.getRingerDevicesList();
  }

  subscribeEmergencyAddressChange(listener: notificationCallback) {
    TelephonyGlobalConfig.onEmergencyAddressChange(listener);
  }

  subscribeSipProvEAUpdated(listener: notificationCallback) {
    notificationCenter.on(
      SERVICE.TELEPHONY_SERVICE.SIP_PROVISION_EA_UPDATED,
      listener,
    );
  }

  subscribeSipProvReceived(listener: notificationCallback) {
    notificationCenter.on(
      SERVICE.TELEPHONY_SERVICE.SIP_PROVISION_RECEIVED,
      listener,
    );
  }

  getLocalEmergencyAddress() {
    return this._accountController
      ? this._accountController.getLocalEmergencyAddress()
      : undefined;
  }

  setLocalEmergencyAddress(emergencyAddress: RTCSipEmergencyServiceAddr) {
    this._accountController.setLocalEmergencyAddress(emergencyAddress);
  }

  updateLocalEmergencyAddress(emergencyAddress: RTCSipEmergencyServiceAddr) {
    this._accountController.updateLocalEmergencyAddress(emergencyAddress);
  }

  getRemoteEmergencyAddress() {
    return this._accountController.getRemoteEmergencyAddress();
  }

  hasActiveDL() {
    return !!this.getRemoteEmergencyAddress();
  }

  isEmergencyAddrConfirmed() {
    return this._accountController.isEmergencyAddrConfirmed();
  }

  isAddressEqual(
    objAddr: RTCSipEmergencyServiceAddr,
    othAddr: RTCSipEmergencyServiceAddr,
  ) {
    return this._accountController.isAddressEqual(objAddr, othAddr);
  }
}

export { TelephonyEngineController };
