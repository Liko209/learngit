/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-29 10:21:38
 * Copyright © RingCentral. All rights reserved.
 */

import { RCInfoFetchController } from './RCInfoFetchController';
import { RolePermissionController } from './RolePermissionController';
import {
  PermissionId,
  ERCServiceFeaturePermission,
  RCServiceFeatureName,
} from '../types';
import { RCServiceFeature } from '../../../api/ringcentral';
import { CompanyService } from 'sdk/module/company';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { E_ACCOUNT_TYPE } from 'sdk/module/company/entity';
import { FEATURE_PERMISSION_MAP_VALUE } from './FeaturePermissionMap';

class RCPermissionController {
  private _featurePermissionMap: Map<
    ERCServiceFeaturePermission,
    { featureName?: RCServiceFeatureName; permissionId?: PermissionId }
  >;

  constructor(
    private _rcInfoFetchController: RCInfoFetchController,
    private _rolePermissionController: RolePermissionController,
  ) {
    this._initFeaturePermissionMap();
  }

  private async _isRCServiceFeatureEnabled(
    featureName: RCServiceFeatureName,
  ): Promise<boolean> {
    const extInfo = await this._rcInfoFetchController.getRCExtensionInfo();
    if (extInfo && extInfo.serviceFeatures) {
      const feature = extInfo.serviceFeatures.find((item: RCServiceFeature) => {
        return item.featureName === featureName;
      });
      if (feature && feature.enabled) {
        return feature.enabled;
      }
    }
    return false;
  }

  private async _isDisabledRcPermissionForRcProAndFaxUser(
    featurePermission: ERCServiceFeaturePermission,
  ) {
    const companyService = ServiceLoader.getInstance<CompanyService>(
      ServiceConfig.COMPANY_SERVICE,
    );
    const accountType = await companyService.getUserAccountTypeFromSP430();
    switch (featurePermission) {
      case ERCServiceFeaturePermission.VOIP_CALLING:
      case ERCServiceFeaturePermission.DOMESTIC_CALLS:
      case ERCServiceFeaturePermission.INTERNAL_CALLS:
      case ERCServiceFeaturePermission.RINGCENTRAL_MOBILE_APP:
      case ERCServiceFeaturePermission.CONFERENCING:
        if (accountType) {
          return accountType !== E_ACCOUNT_TYPE.RC_MOBILE;
        }
        return false;
      case ERCServiceFeaturePermission.VIDEO_CONFERENCING:
        return true;
      default:
        return false;
    }
  }

  private async _isRcProOrFaxUser() {
    const companyService = ServiceLoader.getInstance<CompanyService>(
      ServiceConfig.COMPANY_SERVICE,
    );
    const accountType = await companyService.getUserAccountTypeFromSP430();
    return (
      accountType === E_ACCOUNT_TYPE.RC_MOBILE ||
      accountType === E_ACCOUNT_TYPE.RC_FAX
    );
  }

  private async _checkSpecialRCFeaturePermission(
    featurePermission: ERCServiceFeaturePermission,
  ) {
    let isFound = true;
    let isEnabled = false;
    let needContinueChecking = true;

    // TODO _isChinaRegionApptelephonyEnable  FIJI-4186

    if (
      await this._isDisabledRcPermissionForRcProAndFaxUser(featurePermission)
    ) {
      needContinueChecking = !(await this._isRcProOrFaxUser());
    }

    if (!needContinueChecking) {
      return { found: isFound, enabled: isEnabled };
    }

    switch (featurePermission) {
      case ERCServiceFeaturePermission.VOIP_CALLING:
        isEnabled = await this._isRCServiceFeatureEnabled(
          RCServiceFeatureName.VOIP_CALLING,
        );
        break;
      default:
        isFound = false;
        break;
    }

    return { found: isFound, enabled: isEnabled };
  }

  private async _checkGeneralRCFeaturePermission(
    featurePermission: ERCServiceFeaturePermission,
  ) {
    let isFound = false;
    let isEnabled = false;
    const permissionItem = this._featurePermissionMap.get(featurePermission);
    if (permissionItem) {
      isFound = true;
      const isFeatureEnabled = permissionItem.featureName
        ? await this._isRCServiceFeatureEnabled(permissionItem.featureName)
        : true;
      const isPermissionEnabled = permissionItem.permissionId
        ? await this._rolePermissionController.hasPermission(
            permissionItem.permissionId,
          )
        : true;
      isEnabled = isFeatureEnabled && isPermissionEnabled;
    }

    return { found: isFound, enabled: isEnabled };
  }

  async isRCFeaturePermissionEnabled(
    featurePermission: ERCServiceFeaturePermission,
  ): Promise<boolean> {
    let result = await this._checkSpecialRCFeaturePermission(featurePermission);
    if (result.found) {
      return result.enabled;
    }
    result = await this._checkGeneralRCFeaturePermission(featurePermission);
    return result.enabled;
  }

  private _initFeaturePermissionMap() {
    this._featurePermissionMap = new Map(FEATURE_PERMISSION_MAP_VALUE);
  }
}

export { RCPermissionController };
