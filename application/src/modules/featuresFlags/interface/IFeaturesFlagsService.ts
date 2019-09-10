/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-09-04 13:45:09
 * Copyright © RingCentral. All rights reserved.
 */

interface IFeaturesFlagsService {
  canIUseConference: boolean;
  canIUseTelephony: boolean;
  getSupportFeatureModules(): Promise<string[]>;
  getModulesByFeatureName(featureName: string): string[];
  canUseTelephony(): Promise<boolean>;
  canUseConference(): Promise<boolean>;
  canUseMessage(): Promise<boolean>;
}

export { IFeaturesFlagsService };
