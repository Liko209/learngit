/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-18 18:50:30
 * Copyright © RingCentral. All rights reserved.
 */

import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { featureModuleConfig } from '../config/featureModuleConfig';
import _ from 'lodash';
import { TelephonyService } from 'sdk/module/telephony';

class FeaturesFlagsService {
  private _telephonyService = ServiceLoader.getInstance<TelephonyService>(
    ServiceConfig.TELEPHONY_SERVICE,
  );
  private _featureModuleMap = new Map();

  constructor() {
    featureModuleConfig.forEach(feature => {
      const { featureName, depModules } = feature;
      this._featureModuleMap.set(featureName, depModules);
    });
  }

  canUseTelephony = async () => {
    return await this._telephonyService.getVoipCallPermission();
  }

  getSupportFeatureModules = async () => {
    const supportFeature = await this._getSupportFeature();
    let featureModules: string[] = [];

    supportFeature.forEach(featureName => {
      featureModules = featureModules.concat(
        this.getModulesByFeatureName(featureName),
      );
    });

    return _.uniq(featureModules);
  }

  getModulesByFeatureName = (featureName: string) => {
    let modules: string[] = [];
    const hasFeature = this._featureModuleMap.has(featureName);
    if (hasFeature) {
      modules = this._featureModuleMap.get(featureName);
    }
    return modules;
  }

  private async _getSupportFeature() {
    const defaultSupportFeatures: string[] = [];
    featureModuleConfig.forEach(feature => {
      defaultSupportFeatures.push(feature.featureName);
    });

    return defaultSupportFeatures;
  }
}

export { FeaturesFlagsService };
