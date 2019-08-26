/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-18 18:50:30
 * Copyright © RingCentral. All rights reserved.
 */

import { PermissionService, UserPermissionType } from 'sdk/module/permission';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { featureModuleConfig } from '../config/featureModuleConfig';
import _ from 'lodash';
import { CALLING_OPTIONS } from 'sdk/module/profile';
import { getSingleEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';

class FeaturesFlagsService {
  private _permissionService = ServiceLoader.getInstance<PermissionService>(
    ServiceConfig.PERMISSION_SERVICE,
  );
  private _rcInfoService = ServiceLoader.getInstance<RCInfoService>(
    ServiceConfig.RC_INFO_SERVICE,
  );
  private _featureModuleMap = new Map();

  constructor() {
    featureModuleConfig.forEach(feature => {
      const { featureName, depModules } = feature;
      this._featureModuleMap.set(featureName, depModules);
    });
  }

  canUseTelephony = async () => {
    return (
      (await this._rcInfoService.isVoipCallingAvailable()) &&
      (await this._permissionService.hasPermission(
        UserPermissionType.JUPITER_CAN_USE_TELEPHONY,
      ))
    );
  };

  canUseConference = async () => {
    const useGlip =
      getSingleEntity(ENTITY_NAME.PROFILE, 'callOption') ===
      CALLING_OPTIONS.GLIP;
    return useGlip
      ? this.canUseTelephony()
      : this._rcInfoService.isWebPhoneAvailable();
  };

  getSupportFeatureModules = async () => {
    const supportFeature = await this._getSupportFeature();
    let featureModules: string[] = [];

    supportFeature.forEach(featureName => {
      featureModules = featureModules.concat(
        this.getModulesByFeatureName(featureName),
      );
    });

    return _.uniq(featureModules);
  };

  getModulesByFeatureName = (featureName: string) => {
    let modules: string[] = [];
    const hasFeature = this._featureModuleMap.has(featureName);
    if (hasFeature) {
      modules = this._featureModuleMap.get(featureName);
    }
    return modules;
  };

  private async _getSupportFeature() {
    const defaultSupportFeatures: string[] = [];
    featureModuleConfig.forEach(feature => {
      defaultSupportFeatures.push(feature.featureName);
    });

    return defaultSupportFeatures;
  }
}

export { FeaturesFlagsService };
