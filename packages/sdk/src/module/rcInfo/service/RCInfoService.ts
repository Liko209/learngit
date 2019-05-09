/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-18 13:07:35
 * Copyright © RingCentral. All rights reserved.
 */

import { SERVICE } from '../../../service/eventKey';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { RCInfoController } from '../controller/RCInfoController';
import { ERCServiceFeaturePermission, ERCWebSettingUri } from '../types';
import { ACCOUNT_TYPE_ENUM } from '../../../authenticator/constants';
import { AccountUserConfig } from '../../../module/account/config';
import { mainLogger } from 'foundation';
import { IdModel } from '../../../framework/model';

class RCInfoService extends EntityBaseService<IdModel> {
  private _rcInfoController: RCInfoController;

  constructor() {
    super(false);
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SERVICE.LOGIN]: this.requestRCInfo,
      }),
    );
  }

  protected onStopped() {
    if (this._rcInfoController) {
      this._rcInfoController.dispose();
      delete this._rcInfoController;
    }
    super.onStopped();
  }

  protected getRCInfoController(): RCInfoController {
    if (!this._rcInfoController) {
      this._rcInfoController = new RCInfoController();
    }
    return this._rcInfoController;
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
    const userConfig = new AccountUserConfig();
    const result =
      userConfig.getAccountType() === ACCOUNT_TYPE_ENUM.RC &&
      (await this.getRCInfoController()
        .getRCPermissionController()
        .isRCFeaturePermissionEnabled(
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
  async generateWebSettingUri(type: ERCWebSettingUri) {
    return this.getRCInfoController()
      .getRcWebSettingInfoController()
      .generateRCAuthCodeUri(type);
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
    await this.getRCInfoController()
      .getRegionInfoController()
      .loadRegionInfo();
  }
}

export { RCInfoService };
