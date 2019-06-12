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
    switch (featurePermission) {
      case ERCServiceFeaturePermission.VOIP_CALLING:
      case ERCServiceFeaturePermission.DOMESTIC_CALLS:
      case ERCServiceFeaturePermission.INTERNAL_CALLS:
      case ERCServiceFeaturePermission.RINGCENTRAL_MOBILE_APP:
      case ERCServiceFeaturePermission.CONFERENCING:
        const companyService = ServiceLoader.getInstance<CompanyService>(
          ServiceConfig.COMPANY_SERVICE,
        );
        const accountType = await companyService.getUserAccountTypeFromSP430();
        if (accountType) {
          return accountType !== E_ACCOUNT_TYPE.RC_MOBILE;
        }
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
    for (const item of this._featurePermissionMap) {
      if (featurePermission === item[0]) {
        isFound = true;
        const feature = item[1];
        const isFeatureEnabled = feature.featureName
          ? await this._isRCServiceFeatureEnabled(feature.featureName)
          : true;
        const isPermissionEnabled = feature.permissionId
          ? await this._rolePermissionController.hasPermission(
              feature.permissionId,
            )
          : true;
        isEnabled = isFeatureEnabled && isPermissionEnabled;
        break;
      }
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
    this._featurePermissionMap = new Map([
      [
        ERCServiceFeaturePermission.VOIP_CALLING,
        {
          featureName: RCServiceFeatureName.VOIP_CALLING,
        },
      ],
      [
        ERCServiceFeaturePermission.INTERNATIONAL_CALLING,
        {
          featureName: RCServiceFeatureName.INTERNATIONAL_CALLING,
          permissionId: PermissionId.INTERNATIONAL_CALLS,
        },
      ],
      [
        ERCServiceFeaturePermission.CALL_PARK,
        {
          featureName: RCServiceFeatureName.CALL_PARK,
        },
      ],
      [
        ERCServiceFeaturePermission.CALL_TRANSFER,
        {
          featureName: RCServiceFeatureName.SINGLE_EXTENSION_UI,
        },
      ],
      [
        ERCServiceFeaturePermission.CALL_FLIP,
        {
          featureName: RCServiceFeatureName.SINGLE_EXTENSION_UI,
        },
      ],
      [
        ERCServiceFeaturePermission.CALL_FORWARDING,
        {
          featureName: RCServiceFeatureName.CALL_FORWARDING,
        },
      ],
      [
        ERCServiceFeaturePermission.INTERNAL_CALLS,
        {
          permissionId: PermissionId.INTERNAL_CALLS,
        },
      ],
      [
        ERCServiceFeaturePermission.DOMESTIC_CALLS,
        {
          permissionId: PermissionId.DOMESTIC_CALLS,
        },
      ],
      [
        ERCServiceFeaturePermission.READ_COMPANY_CALLLOG,
        {
          permissionId: PermissionId.READ_COMPANY_CALLLOG,
        },
      ],
      [
        ERCServiceFeaturePermission.CALL_SWITCH,
        {
          featureName: RCServiceFeatureName.CALL_SWITCH,
        },
      ],
      [
        ERCServiceFeaturePermission.PAGER_SEND,
        {
          featureName: RCServiceFeatureName.PAGER,
          permissionId: PermissionId.INTERNAL_SMS,
        },
      ],
      [
        ERCServiceFeaturePermission.FAX,
        {
          featureName: RCServiceFeatureName.FAX,
        },
      ],
      [
        ERCServiceFeaturePermission.VIDEO_CONFERENCING,
        {
          featureName: RCServiceFeatureName.VIDEO_CONFERENCING,
          PermissionId: PermissionId.PERMISSION_MEEINGS,
        },
      ],
      [
        ERCServiceFeaturePermission.CONFERENCING,
        {
          featureName: RCServiceFeatureName.CONFERENCING,
        },
      ],
    ]);
  }
}

export { RCPermissionController };
