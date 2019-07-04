/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-18 13:07:35
 * Copyright © RingCentral. All rights reserved.
 */

import { SERVICE } from '../../../service/eventKey';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { RCInfoController } from '../controller/RCInfoController';
import {
  ERCServiceFeaturePermission,
  ERCWebUris,
  ForwardingFlipNumberModel,
  EForwardingNumberFeatureType,
} from '../types';
import { ACCOUNT_TYPE_ENUM } from '../../../authenticator/constants';
import { AccountService } from '../../account/service';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { mainLogger } from 'foundation';
import { IRCInfoService } from './IRCInfoService';
import { RcInfoSettings } from '../setting';
import { IdModel } from '../../../framework/model';
import { RCInfoUserConfig } from '../config';
import { RC_INFO_HISTORY } from '../config/constants';
import { SettingService } from 'sdk/module/setting';

class RCInfoService extends EntityBaseService<IdModel>
  implements IRCInfoService {
  private _rcInfoController: RCInfoController;
  private _rcInfoSettings: RcInfoSettings;
  private _DBConfig: RCInfoUserConfig;

  constructor() {
    super({ isSupportedCache: false });
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SERVICE.LOGIN]: this.requestRCInfo,
      }),
    );
  }

  getHistoryDetail() {
    return RC_INFO_HISTORY;
  }

  protected onStarted() {
    super.onStarted();
    ServiceLoader.getInstance<SettingService>(
      ServiceConfig.SETTING_SERVICE,
    ).registerModuleSetting(this.rcInfoSettings);
  }

  protected onStopped() {
    super.onStopped();
    if (this._rcInfoController) {
      this._rcInfoController.dispose();
      delete this._rcInfoController;
    }

    if (this._rcInfoSettings) {
      ServiceLoader.getInstance<SettingService>(
        ServiceConfig.SETTING_SERVICE,
      ).unRegisterModuleSetting(this._rcInfoSettings);
      delete this._rcInfoSettings;
    }
  }

  protected getRCInfoController(): RCInfoController {
    if (!this._rcInfoController) {
      this._rcInfoController = new RCInfoController();
    }
    return this._rcInfoController;
  }

  private get rcInfoSettings() {
    if (!this._rcInfoSettings) {
      this._rcInfoSettings = new RcInfoSettings(this);
    }
    return this._rcInfoSettings;
  }

  get DBConfig() {
    if (!this._DBConfig) {
      this._DBConfig = new RCInfoUserConfig();
    }
    return this._DBConfig;
  }

  requestRCInfo = () => {
    this.getRCInfoController()
      .getRCInfoFetchController()
      .requestRCInfo();
  }

  async requestRCAccountRelativeInfo() {
    await this.getRCInfoController()
      .getRCInfoFetchController()
      .requestRCAccountRelativeInfo();
  }

  async getRCClientInfo() {
    return await this.getRCInfoController()
      .getRCInfoFetchController()
      .getRCClientInfo();
  }

  async getRCBrandId() {
    return await this.getRCInfoController()
      .getRCAccountInfoController()
      .getAccountBrandId();
  }

  async getRCAccountId() {
    return await this.getRCInfoController()
      .getRCAccountInfoController()
      .getRCAccountId();
  }

  async getRCExtensionId() {
    return await this.getRCInfoController()
      .getRCInfoFetchController()
      .getRCExtensionId();
  }

  async getRCAccountInfo() {
    return await this.getRCInfoController()
      .getRCInfoFetchController()
      .getRCAccountInfo();
  }

  async getRCExtensionInfo() {
    return await this.getRCInfoController()
      .getRCInfoFetchController()
      .getRCExtensionInfo();
  }

  async getRCRolePermissions() {
    return await this.getRCInfoController()
      .getRCInfoFetchController()
      .getRCRolePermissions();
  }

  async getSpecialNumberRule() {
    return await this.getRCInfoController()
      .getRCInfoFetchController()
      .getSpecialNumberRule();
  }

  async getPhoneData() {
    return await this.getRCInfoController()
      .getRCInfoFetchController()
      .getPhoneData();
  }

  async setPhoneData(phoneData: string) {
    await this.getRCInfoController()
      .getRCInfoFetchController()
      .setPhoneData(phoneData);
  }

  async setPhoneDataVersion(phoneData: string) {
    await this.getRCInfoController()
      .getRCInfoFetchController()
      .setPhoneDataVersion(phoneData);
  }

  async isVoipCallingAvailable(): Promise<boolean> {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const result =
      userConfig.getAccountType() === ACCOUNT_TYPE_ENUM.RC &&
      (await this.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.VOIP_CALLING,
      ));
    mainLogger.debug(`isVoipCallingAvailable: ${result}`);
    return result;
  }

  async isRCFeaturePermissionEnabled(
    featurePermission: ERCServiceFeaturePermission,
  ) {
    return this.getRCInfoController()
      .getRCPermissionController()
      .isRCFeaturePermissionEnabled(featurePermission);
  }

  async getCallerIdList() {
    return await this.getRCInfoController()
      .getRCCallerIdController()
      .getCallerIdList();
  }

  async setDefaultCallerId(callerId: number) {
    await this.getRCInfoController()
      .getRCCallerIdController()
      .setDefaultCallerId(callerId);
  }

  async getDefaultCallerId() {
    return await this.getRCInfoController()
      .getRCCallerIdController()
      .getDefaultCallerId();
  }

  async hasSetCallerId() {
    return await this.getRCInfoController()
      .getRCCallerIdController()
      .hasSetCallerId();
  }

  async generateWebSettingUri(type: ERCWebUris) {
    return this.getRCInfoController()
      .getRcWebSettingInfoController()
      .getRCWebUriByType(type);
  }

  private get regionInfoController() {
    return this.getRCInfoController().getRegionInfoController();
  }

  async getCountryList() {
    return await this.regionInfoController.getCountryList();
  }

  async getCurrentCountry() {
    return await this.regionInfoController.getCurrentCountry();
  }

  async setDefaultCountry(isoCode: string) {
    return await this.regionInfoController.setDefaultCountry(isoCode);
  }

  async setAreaCode(areaCode: string) {
    return await this.regionInfoController.setAreaCode(areaCode);
  }

  async getAreaCode() {
    return await this.regionInfoController.getAreaCode();
  }

  hasAreaCode(countryCallingCode: string) {
    return this.regionInfoController.hasAreaCode(countryCallingCode);
  }

  async isAreaCodeValid(areaCode: string) {
    return await this.regionInfoController.isAreaCodeValid(areaCode);
  }

  async loadRegionInfo() {
    (await this.isVoipCallingAvailable()) &&
      (await this.getRCInfoController()
        .getRegionInfoController()
        .loadRegionInfo());
  }

  async getCallerById(callerId: number) {
    return this.getRCInfoController()
      .getRCCallerIdController()
      .getCallerById(callerId);
  }

  async getFirstDidCaller() {
    return this.getRCInfoController()
      .getRCCallerIdController()
      .getFirstDidCaller();
  }

  async getCompanyMainCaller() {
    return this.getRCInfoController()
      .getRCCallerIdController()
      .getCompanyMainCaller();
  }

  async getAccountId() {
    return this.getRCInfoController()
      .getRCAccountInfoController()
      .getAccountId();
  }

  async getForwardingNumberList(): Promise<ForwardingFlipNumberModel[]> {
    return await this.getRCInfoController()
      .getRCInfoFetchController()
      .getForwardingFlipNumbers(EForwardingNumberFeatureType.FORWARDING);
  }

  async getFlipNumberList(): Promise<ForwardingFlipNumberModel[]> {
    return await this.getRCInfoController()
      .getRCInfoFetchController()
      .getForwardingFlipNumbers(EForwardingNumberFeatureType.FLIP);
  }
}

export { RCInfoService };
