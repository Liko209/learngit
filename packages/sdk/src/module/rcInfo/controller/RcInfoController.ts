/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-18 15:04:00
 * Copyright © RingCentral. All rights reserved.
 */

import { RcInfoUserConfig } from '../config';
import { NewGlobalConfig } from '../../../service/config/NewGlobalConfig';
import { ACCOUNT_TYPE_ENUM } from '../../../authenticator/constants';
import { RcInfoApi, TelephonyApi } from '../../../api/ringcentral';
import { PhoneParserUtility } from '../../../utils/phoneParser';
import { jobScheduler, JOB_KEY } from '../../../framework/utils/jobSchedule';
import AccountService from '../../../service/account';
import { mainLogger } from 'foundation';
import {
  PermissionId,
  ERcServiceFeaturePermission,
  RCServiceFeatureName,
} from '../types';
import {
  RcExtensionInfo,
  RcServiceFeature,
} from '../../../api/ringcentral/types/RcExtensionInfo';
import { RolePermissionController } from '../controller/RolePermissionController';

class RcInfoController {
  private _rcInfoUserConfig: RcInfoUserConfig;
  private _isRcInfoJobScheduled: boolean;
  private _rolePermissionController: RolePermissionController;
  private _featurePermissionMap: Map<
    ERcServiceFeaturePermission,
    { featureName?: RCServiceFeatureName; permissionId?: PermissionId }
  > = new Map();

  constructor() {
    this._isRcInfoJobScheduled = false;
    this._rolePermissionController = new RolePermissionController();
    this._buildFeaturePermissionMap();
  }

  private get rcInfoUserConfig(): RcInfoUserConfig {
    if (!this._rcInfoUserConfig) {
      this._rcInfoUserConfig = new RcInfoUserConfig();
    }
    return this._rcInfoUserConfig;
  }

  async requestRcInfo() {
    const accountService: AccountService = AccountService.getInstance();
    const accountType = NewGlobalConfig.getAccountType();
    if (
      !this._isRcInfoJobScheduled &&
      accountService.isAccountReady() &&
      accountType === ACCOUNT_TYPE_ENUM.RC
    ) {
      jobScheduler.scheduleDailyPeriodicJob(
        JOB_KEY.FETCH_CLIENT_INFO,
        this.requestRcClientInfo,
      );
      jobScheduler.scheduleDailyPeriodicJob(
        JOB_KEY.FETCH_ACCOUNT_INFO,
        this.requestRcAccountInfo,
      );
      jobScheduler.scheduleDailyPeriodicJob(
        JOB_KEY.FETCH_EXTENSION_INFO,
        this.requestRcExtensionInfo,
      );
      jobScheduler.scheduleDailyPeriodicJob(
        JOB_KEY.FETCH_ROLE_PERMISSION,
        this.requestRcRolePermission,
      );
      jobScheduler.scheduleDailyPeriodicJob(
        JOB_KEY.FETCH_PHONE_DATA,
        this.requestRcPhoneData,
      );
      this._isRcInfoJobScheduled = true;
    }
  }

  requestRcClientInfo = async (callback: (successful: boolean) => void) => {
    try {
      const result = await RcInfoApi.requestRcClientInfo();
      this.rcInfoUserConfig.setClientInfo(result);
      callback(true);
    } catch (err) {
      mainLogger.error(`requestRcClientInfo error: ${err}`);
      callback(false);
    }
  }

  requestRcAccountInfo = async (callback: (successful: boolean) => void) => {
    try {
      const result = await RcInfoApi.requestRcAccountInfo();
      this.rcInfoUserConfig.setAccountInfo(result);
      callback(true);
    } catch (err) {
      mainLogger.error(`requestRcAccountInfo error: ${err}`);
      callback(false);
    }
  }

  requestRcExtensionInfo = async (callback: (successful: boolean) => void) => {
    try {
      const result = await RcInfoApi.requestRcExtensionInfo();
      this.rcInfoUserConfig.setExtensionInfo(result);
      callback(true);
    } catch (err) {
      mainLogger.error(`requestRcExtensionInfo error: ${err}`);
      callback(false);
    }
  }

  requestRcRolePermission = async (callback: (successful: boolean) => void) => {
    try {
      const result = await RcInfoApi.requestRcRolePermission();
      this.rcInfoUserConfig.setRolePermission(result);
      callback(true);
    } catch (err) {
      mainLogger.error(`requestRcRolePermission error: ${err}`);
      callback(false);
    }
  }

  requestRcPhoneData = async (callback: (successful: boolean) => void) => {
    try {
      const phoneDataVersion: string =
        PhoneParserUtility.getPhoneDataFileVersion() || '';
      const result = await TelephonyApi.getPhoneParserData(phoneDataVersion);
      NewGlobalConfig.setPhoneData(result);
      PhoneParserUtility.initPhoneParser(true);
      callback(true);
    } catch (err) {
      mainLogger.error(`requestRcPhoneData error: ${err.message}`);
      if (err.message.includes('Not Modified')) {
        callback(true);
      } else {
        callback(false);
      }
    }
  }

  private _isRcServiceFeatureEnabled(featureName: RCServiceFeatureName) {
    const extInfo: RcExtensionInfo = this._rcInfoUserConfig.getExtensionInfo();
    if (extInfo && extInfo.serviceFeatures) {
      const feature = extInfo.serviceFeatures.find((item: RcServiceFeature) => {
        return item.featureName === featureName;
      });
      if (feature && feature.enabled) {
        return feature.enabled;
      }
    }
    return false;
  }

  private _checkSpecialRcFeaturePermission(
    featurePermission: ERcServiceFeaturePermission,
  ) {
    // TODO _isChinaRegionApptelephonyEnable  FIJI-4186

    // TODO _isDisabledRcPermissionForRcProAndFaxUser FIJI-4185
    let isFound = true;
    let isEnabled = false;

    switch (featurePermission) {
      case ERcServiceFeaturePermission.VOIP_CALLING:
        isEnabled = this._isRcServiceFeatureEnabled(
          RCServiceFeatureName.VOIP_CALLING,
        );
        break;
      default:
        isFound = false;
        break;
    }

    return { found: isFound, enabled: isEnabled };
  }

  private _buildFeaturePermissionMap() {
    this._featurePermissionMap.set(
      ERcServiceFeaturePermission.VOIP_CALLING_WITHOUT_TELEPHONY_BETA,
      {
        featureName: RCServiceFeatureName.VOIP_CALLING,
      },
    );
    this._featurePermissionMap.set(
      ERcServiceFeaturePermission.INTERNATIONAL_CALLING,
      {
        featureName: RCServiceFeatureName.INTERNATIONAL_CALLING,
        permissionId: PermissionId.INTERNATIONAL_CALLS,
      },
    );

    this._featurePermissionMap.set(ERcServiceFeaturePermission.CALL_PARK, {
      featureName: RCServiceFeatureName.CALL_PARK,
    });

    this._featurePermissionMap.set(ERcServiceFeaturePermission.CALL_TRANSFER, {
      featureName: RCServiceFeatureName.SINGLE_EXTENSION_UI,
    });

    this._featurePermissionMap.set(ERcServiceFeaturePermission.CALL_FLIP, {
      featureName: RCServiceFeatureName.SINGLE_EXTENSION_UI,
    });

    this._featurePermissionMap.set(ERcServiceFeaturePermission.INTERNAL_CALLS, {
      permissionId: PermissionId.INTERNAL_CALLS,
    });

    this._featurePermissionMap.set(ERcServiceFeaturePermission.DOMESTIC_CALLS, {
      permissionId: PermissionId.DOMESTIC_CALLS,
    });

    this._featurePermissionMap.set(ERcServiceFeaturePermission.CALL_SWITCH, {
      featureName: RCServiceFeatureName.CALL_SWITCH,
    });

    this._featurePermissionMap.set(
      ERcServiceFeaturePermission.READ_COMPANY_CALLLOG,
      {
        permissionId: PermissionId.READ_COMPANY_CALLLOG,
      },
    );

    this._featurePermissionMap.set(ERcServiceFeaturePermission.PAGER_SEND, {
      featureName: RCServiceFeatureName.PAGER,
      permissionId: PermissionId.INTERNAL_SMS,
    });

    this._featurePermissionMap.set(ERcServiceFeaturePermission.FAX, {
      featureName: RCServiceFeatureName.FAX,
    });
  }

  private _checkGeneralRcFeaturePermission(
    featurePermission: ERcServiceFeaturePermission,
  ) {
    let isFound = false;
    let isEnabled = false;
    for (const item of this._featurePermissionMap) {
      if (featurePermission === item[0]) {
        isFound = true;
        const feature = item[1];
        const isFeatureEnabled = feature.featureName
          ? this._isRcServiceFeatureEnabled(feature.featureName)
          : true;
        const isPermissionEnabled = feature.permissionId
          ? this._rolePermissionController.hasPermission(feature.permissionId)
          : true;
        isEnabled = isFeatureEnabled && isPermissionEnabled;
        break;
      }
    }
    return { found: isFound, enabled: isEnabled };
  }

  isRcFeaturePermissionEnabled(featurePermission: ERcServiceFeaturePermission) {
    let result = this._checkSpecialRcFeaturePermission(featurePermission);
    if (result.found) {
      return result.enabled;
    }
    result = this._checkGeneralRcFeaturePermission(featurePermission);
    return result.enabled;
  }
}

export { RcInfoController };
