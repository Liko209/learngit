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
  IAssignLineRequest,
  IUpdateLineRequest,
  StateRecord,
} from '../types';
import { ACCOUNT_TYPE_ENUM } from '../../../authenticator/constants';
import { AccountService } from '../../account/service';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { mainLogger } from 'foundation/log';
import { IRCInfoService } from './IRCInfoService';
import { RcInfoSettings } from '../setting';
import { IdModel } from '../../../framework/model';
import { RCInfoUserConfig } from '../config';
import { RC_INFO_HISTORY } from '../config/constants';
import { SettingService } from 'sdk/module/setting';
import { CountryRecord } from 'sdk/api';

class RCInfoService extends EntityBaseService<IdModel>
  implements IRCInfoService {
  private _rcInfoController: RCInfoController;
  private _rcInfoSettings: RcInfoSettings;
  private _DBConfig: RCInfoUserConfig;

  constructor() {
    super({ isSupportedCache: false });
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SERVICE.RC_LOGIN]: this.onRCLogin,
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
    this.getRCInfoController().blockNumberController.init();
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
    this.getRCInfoController().blockNumberController.dispose();
  }

  protected getRCInfoController(): RCInfoController {
    if (!this._rcInfoController) {
      this._rcInfoController = new RCInfoController(this.DBConfig);
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

  onRCLogin = () => {
    this.requestRCInfo();
  };

  requestRCInfo = () => {
    this.getRCInfoController()
      .getRCInfoFetchController()
      .requestRCInfo();
  };

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

  async getUserEmail() {
    return await this.getRCInfoController()
      .getRCInfoFetchController()
      .getUserEmail();
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
    const result =
      this.isRCAccount() &&
      (await this.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.VOIP_CALLING,
      )) &&
      (await this.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.WEB_PHONE,
      ));
    mainLogger.debug(`isVoipCallingAvailable: ${result}`);
    return result;
  }

  async isOrganizeConferenceAvailable(): Promise<boolean> {
    const result =
      this.isRCAccount() &&
      (await this.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.ORGANIZE_CONFERENCE,
      ));
    mainLogger.debug(`isWebPhoneAvailable: ${result}`);
    return result;
  }

  async isWebPhoneAvailable(): Promise<boolean> {
    const result =
      this.isRCAccount() &&
      (await this.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.WEB_PHONE,
      ));
    mainLogger.debug(`isWebPhoneAvailable: ${result}`);
    return result;
  }

  isRCAccount() {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    return userConfig.getAccountType() === ACCOUNT_TYPE_ENUM.RC;
  }

  async getAccountMainNumber() {
    return this.getRCInfoController()
      .getRCAccountInfoController()
      .getAccountMainNumber();
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

  async getDefaultCountryInfo() {
    return await this.regionInfoController.getDefaultCountryInfo();
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

  async getStateList(countryId: string): Promise<StateRecord[]> {
    return this.regionInfoController.getStateList(countryId);
  }

  async getAllCountryList(): Promise<CountryRecord[]> {
    return this.regionInfoController.getAllCountryList();
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

  async isNumberBlocked(phoneNumber: string): Promise<boolean> {
    return await this.getRCInfoController().blockNumberController.isNumberBlocked(
      phoneNumber,
    );
  }

  async deleteBlockedNumbers(phoneNumbers: string[]): Promise<void> {
    await this.getRCInfoController().blockNumberController.deleteBlockedNumbers(
      phoneNumbers,
    );
  }

  async addBlockedNumber(phoneNumber: string): Promise<void> {
    await this.getRCInfoController().blockNumberController.addBlockedNumber(
      phoneNumber,
    );
  }

  async syncUserRCPresence() {
    return await this.getRCInfoController().rcPresenceController.syncRCPresence();
  }

  async getDigitalLines() {
    return await this.getRCInfoController()
      .getRCInfoFetchController()
      .getDigitalLines();
  }

  async assignLine(deviceId: string, data: IAssignLineRequest) {
    await this.getRCInfoController()
      .getRCDeviceController()
      .assignLine(deviceId, data);
  }

  async updateLine(deviceId: string, data: IUpdateLineRequest) {
    await this.getRCInfoController()
      .getRCDeviceController()
      .updateLine(deviceId, data);
  }
}

export { RCInfoService };
