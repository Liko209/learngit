/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-18 18:50:30
 * Copyright © RingCentral. All rights reserved.
 */

import { PermissionService, UserPermissionType } from 'sdk/module/permission';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { featureModuleConfig } from '../config/featureModuleConfig';
class FeaturesFlagsService {
  private _permissionService = ServiceLoader.getInstance<PermissionService>(
    ServiceConfig.PERMISSION_SERVICE,
  );
  private _rcInfoService = ServiceLoader.getInstance<RCInfoService>(
    ServiceConfig.RC_INFO_SERVICE,
  );

  canUseTelephony = async () => {
    return (
      (await this._rcInfoService.isVoipCallingAvailable()) &&
      (await this._permissionService.hasPermission(
        UserPermissionType.JUPITER_CAN_USE_TELEPHONY,
      ))
    );
  }

  getSupportFeatureModules = async () => {
    const featureModuleMap = new Map();
    featureModuleConfig.forEach(feature => {
      const { featureName, depModules } = feature;
      featureModuleMap.set(featureName, depModules);
    });

    const supportFeature = await this._getSupportFeature();
    let featureModules: string[] = [];

    supportFeature.forEach(feature => {
      if (featureModuleMap.has(feature)) {
        const modules = featureModuleMap.get(feature);
        featureModules = featureModules.concat(modules);
      }
    });

    // TODO uniq

    return ['message', 'telephony'];
  }

  private async _getSupportFeature() {
    const defaultSupportFeatures: string[] = [];
    featureModuleConfig.forEach(feature => {
      const { featureName } = feature;
      defaultSupportFeatures.push(featureName);
    });

    const supportFeature: string[] = defaultSupportFeatures;

    if (!(await this.canUseTelephony())) {
      //
    }

    return supportFeature;
  }
}

export { FeaturesFlagsService };
