/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-29 13:39:02
 * Copyright © RingCentral. All rights reserved.
 */

import { FeaturesFlagsService } from '../FeaturesFlagsService';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { featureModuleConfig } from '../../config/featureModuleConfig';
import { getSingleEntity } from '@/store/utils';
import _ from 'lodash';
import { CALLING_OPTIONS } from 'sdk/module/profile';

const permission = {
  hasPermission: jest.fn().mockResolvedValue(true),
  isVoipCallingAvailable: jest.fn().mockResolvedValue(true),
  isWebPhoneAvailable: jest.fn().mockResolvedValueOnce(true),
};
ServiceLoader.getInstance = jest.fn().mockReturnValue(permission);
jest.mock('@/store/utils');

describe('FeaturesFlagsService', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('getSupportFeatureModules()', () => {
    it('should return support module', async () => {
      const featuresFlagsService = new FeaturesFlagsService();
      const modules = await featuresFlagsService.getSupportFeatureModules();
      const featureModules = featureModuleConfig.reduce((modules, feature) => {
        return modules.concat(feature.depModules);
      }, []);
      expect(modules).toEqual(featureModules);
    });
  });

  describe('getModulesByFeatureName()', () => {
    it('should return feature modules by feature name', () => {
      const featuresFlagsService = new FeaturesFlagsService();
      const dashboardModules = featuresFlagsService.getModulesByFeatureName(
        featureModuleConfig[0].featureName,
      );

      expect(dashboardModules).toEqual(featureModuleConfig[0].depModules);
    });
  });

  describe('canUseTelephony()', () => {
    it('should use telephony when service has permission', async () => {
      const featuresFlagsService = new FeaturesFlagsService();

      expect(await featuresFlagsService.canUseTelephony()).toBeTruthy();
    });
  });

  describe('canUseConference()', () => {
    it('should check web phone permission when choose ringcentral', async () => {
      const featuresFlagsService = new FeaturesFlagsService();
      getSingleEntity.mockReturnValueOnce(CALLING_OPTIONS.RINGCENTRAL);
      expect(await featuresFlagsService.canUseTelephony()).toBeTruthy();
    });

    it('should check telephony permission when choose glip', async () => {
      const featuresFlagsService = new FeaturesFlagsService();
      getSingleEntity.mockReturnValueOnce(CALLING_OPTIONS.GLIP);
      expect(await featuresFlagsService.canUseTelephony()).toBeTruthy();
    });
  });
});
