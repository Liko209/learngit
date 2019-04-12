/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-18 13:07:35
 * Copyright © RingCentral. All rights reserved.
 */

import { SERVICE } from '../../../service/eventKey';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { RCInfoController } from '../controller/RCInfoController';
import { ERCServiceFeaturePermission } from '../types';
import { ACCOUNT_TYPE_ENUM } from '../../../authenticator/constants';
import { AccountUserConfig } from '../../../module/account/config';

class RCInfoService extends EntityBaseService {
  private _rcInfoController: RCInfoController;

  constructor() {
    super(false);
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SERVICE.LOGIN]: this.requestRCInfo,
      }),
    );
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
    return (
      userConfig.getAccountType() === ACCOUNT_TYPE_ENUM.RC &&
      (await this.getRCInfoController()
        .getRCPermissionController()
        .isRCFeaturePermissionEnabled(ERCServiceFeaturePermission.VOIP_CALLING))
    );
  }

  async isRCFeaturePermissionEnabled(
    featurePermission: ERCServiceFeaturePermission,
  ) {
    return this.getRCInfoController()
      .getRCPermissionController()
      .isRCFeaturePermissionEnabled(featurePermission);
  }
}

export { RCInfoService };
