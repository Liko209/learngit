/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-18 15:04:00
 * Copyright © RingCentral. All rights reserved.
 */

import { RcInfoUserConfig } from '../config';
import { NewGlobalConfig } from '../../../service/config/NewGlobalConfig';
import { ACCOUNT_TYPE_ENUM } from '../../../authenticator/constants';
import { RcInfoApi, TelephonyApi } from '../../../api/ringcentral';
import {
  RcClientInfo,
  RcAccountInfo,
  RcExtensionInfo,
  RcServiceFeature,
  RcRolePermissions,
  ISpecialServiceNumberResponse,
} from '../../../api/ringcentral/types';
import { PhoneParserUtility } from '../../../utils/phoneParser';
import { jobScheduler, JOB_KEY } from '../../../framework/utils/jobSchedule';
import { AccountService } from '../../../service/account/accountService';
import { mainLogger } from 'foundation';
import {
  PermissionId,
  ERcServiceFeaturePermission,
  RCServiceFeatureName,
} from '../types';
import { RolePermissionController } from '../controller/RolePermissionController';
import notificationCenter from '../../../service/notificationCenter';
import { RC_INFO } from '../../../service/eventKey';
import { AccountUserConfig } from '../../../service/account/config';

class RcInfoController {
  private _rcInfoUserConfig: RcInfoUserConfig;
  private _isRcInfoJobScheduled: boolean;
  private _shouldIgnoreFirstTime: boolean;
  private _clientInfo: RcClientInfo;
  private _accountInfo: RcAccountInfo;
  private _extensionInfo: RcExtensionInfo;
  private _rolePermissions: RcRolePermissions;
  private _specialNumberRule: ISpecialServiceNumberResponse;

  private _rolePermissionController: RolePermissionController;
  private _featurePermissionMap: Map<
    ERcServiceFeaturePermission,
    { featureName?: RCServiceFeatureName; permissionId?: PermissionId }
  > = new Map();

  constructor() {
    this._isRcInfoJobScheduled = false;
    this._shouldIgnoreFirstTime = false;
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
    const userConfig = new AccountUserConfig();
    const accountService: AccountService = AccountService.getInstance();
    const accountType = userConfig.getAccountType();
    if (
      !this._isRcInfoJobScheduled &&
      accountService.isAccountReady() &&
      accountType === ACCOUNT_TYPE_ENUM.RC
    ) {
      // todo: will remove it after config ready
      if (this._shouldIgnoreFirstTime) {
        this.storeRcAccountRelativeInfo();
      }

      this.scheduleRcInfoJob(
        JOB_KEY.FETCH_CLIENT_INFO,
        this.requestRcClientInfo,
        this._shouldIgnoreFirstTime,
      );
      this.scheduleRcInfoJob(
        JOB_KEY.FETCH_ACCOUNT_INFO,
        this.requestRcAccountInfo,
        this._shouldIgnoreFirstTime,
      );
      this.scheduleRcInfoJob(
        JOB_KEY.FETCH_EXTENSION_INFO,
        this.requestRcExtensionInfo,
        this._shouldIgnoreFirstTime,
      );
      this.scheduleRcInfoJob(
        JOB_KEY.FETCH_ROLE_PERMISSIONS,
        this.requestRcRolePermissions,
        this._shouldIgnoreFirstTime,
      );
      this.scheduleRcInfoJob(
        JOB_KEY.FETCH_PHONE_DATA,
        this.requestRcPhoneData,
        false,
      );
      this.scheduleRcInfoJob(
        JOB_KEY.FETCH_SPECIAL_NUMBER_RULE,
        this.requestSpecialNumberRule,
        false,
      );
      this._isRcInfoJobScheduled = true;
    }
  }

  scheduleRcInfoJob(
    key: JOB_KEY,
    executeFunc: () => void,
    ignoreFirstTime: boolean,
  ) {
    jobScheduler.scheduleDailyPeriodicJob(
      key,
      async (callback: (successful: boolean) => void) => {
        try {
          await executeFunc();
          callback(true);
        } catch (err) {
          if (err.message.includes('Not Modified')) {
            callback(true);
          } else {
            mainLogger.error(`RcInfoController, ${key}, ${err}`);
            callback(false);
          }
        }
      },
      true,
      ignoreFirstTime,
    );
  }

  requestRcClientInfo = async (store: boolean = true) => {
    this._clientInfo = await RcInfoApi.requestRcClientInfo();
    store && this.rcInfoUserConfig.setClientInfo(this._clientInfo);
    notificationCenter.emit(RC_INFO.CLIENT_INFO, this._clientInfo);
  }

  requestRcAccountInfo = async (store: boolean = true) => {
    this._accountInfo = await RcInfoApi.requestRcAccountInfo();
    store && this.rcInfoUserConfig.setAccountInfo(this._accountInfo);
    notificationCenter.emit(RC_INFO.ACCOUNT_INFO, this._accountInfo);
  }

  requestRcExtensionInfo = async (store: boolean = true) => {
    this._extensionInfo = await RcInfoApi.requestRcExtensionInfo();
    store && this.rcInfoUserConfig.setExtensionInfo(this._extensionInfo);
    notificationCenter.emit(RC_INFO.EXTENSION_INFO, this._extensionInfo);
  }

  requestRcRolePermissions = async (store: boolean = true) => {
    this._rolePermissions = await RcInfoApi.requestRcRolePermissions();
    this._rolePermissionController.setRolePermissions(this._rolePermissions);
    store && this.rcInfoUserConfig.setRolePermissions(this._rolePermissions);
    notificationCenter.emit(RC_INFO.ROLE_PERMISSIONS, this._rolePermissions);
  }

  requestSpecialNumberRule = async () => {
    this._specialNumberRule = await TelephonyApi.getSpecialNumbers();
    this.rcInfoUserConfig.setSpecialNumberRule(this._specialNumberRule);
    notificationCenter.emit(
      RC_INFO.SPECIAL_NUMBER_RULE,
      this._specialNumberRule,
    );
  }

  requestRcPhoneData = async () => {
    const phoneDataVersion: string =
      PhoneParserUtility.getPhoneDataFileVersion() || '';
    const result = await TelephonyApi.getPhoneParserData(phoneDataVersion);
    NewGlobalConfig.setPhoneData(result);
    PhoneParserUtility.initPhoneParser(true);
    notificationCenter.emit(RC_INFO.PHONE_DATA, result);
  }

  async requestRcAccountRelativeInfo() {
    this._shouldIgnoreFirstTime = true;
    await this.requestRcClientInfo(false);
    await this.requestRcAccountInfo(false);
    await this.requestRcExtensionInfo(false);
    await this.requestRcRolePermissions(false);
  }

  storeRcAccountRelativeInfo() {
    this.rcInfoUserConfig.setClientInfo(this._clientInfo);
    this.rcInfoUserConfig.setAccountInfo(this._accountInfo);
    this.rcInfoUserConfig.setExtensionInfo(this._extensionInfo);
    this.rcInfoUserConfig.setRolePermissions(this._rolePermissions);
  }

  getRcClientInfo() {
    if (!this._clientInfo) {
      this._clientInfo = this.rcInfoUserConfig.getClientInfo();
    }
    return this._clientInfo;
  }

  getRcAccountInfo() {
    if (!this._accountInfo) {
      this._accountInfo = this.rcInfoUserConfig.getAccountInfo();
    }
    return this._accountInfo;
  }

  getRcExtensionInfo() {
    if (!this._extensionInfo) {
      this._extensionInfo = this.rcInfoUserConfig.getExtensionInfo();
    }
    return this._extensionInfo;
  }

  getRcRolePermissions() {
    if (!this._rolePermissions) {
      this._rolePermissions = this.rcInfoUserConfig.getRolePermissions();
    }
    return this._rolePermissions;
  }

  getSpecialNumberRule() {
    if (!this._specialNumberRule) {
      this._specialNumberRule = this.rcInfoUserConfig.getSpecialNumberRule();
    }
    return this._specialNumberRule;
  }

  private _isRcServiceFeatureEnabled(featureName: RCServiceFeatureName) {
    const extInfo: RcExtensionInfo = this.getRcExtensionInfo();
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
