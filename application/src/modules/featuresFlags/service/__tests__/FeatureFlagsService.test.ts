/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-29 13:39:02
 * Copyright © RingCentral. All rights reserved.
 */

import { FeaturesFlagsService } from '../FeaturesFlagsService';
import { ServiceLoader } from 'sdk/module/serviceLoader';

const mockFeatureModule = [
  {
    featureName: 'Dashboard',
    depModules: ['dashboard'],
  },
  {
    featureName: 'Message',
    depModules: ['message'],
  },
  {
    featureName: 'Telephony',
    depModules: ['telephony'],
  },
];

const permission = {
  hasPermission: jest.fn().mockResolvedValue(true),
  isVoipCallingAvailable: jest.fn().mockResolvedValue(true),
};
ServiceLoader.getInstance = jest.fn().mockReturnValue(permission);

describe('FeaturesFlagsService', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('getModulesByFeatureName()', () => {
    it('should return feature modules by feature name', () => {
      const featuresFlagsService = new FeaturesFlagsService();
      const dashboardModules = featuresFlagsService.getModulesByFeatureName(
        mockFeatureModule[0].featureName,
      );

      expect(dashboardModules).toEqual(mockFeatureModule[0].depModules);
    });
  });

  describe('canUseTelephony()', () => {
    it('should use telephony when service has permission', async () => {
      const featuresFlagsService = new FeaturesFlagsService();

      expect(await featuresFlagsService.canUseTelephony()).toBeTruthy();
    });
  });
});
