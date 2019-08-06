/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-24 09:59:10
 * Copyright © RingCentral. All rights reserved.
 */

import { LaunchDarklyController } from '../LaunchDarklyController';

describe('LaunchDarklyController', () => {
  describe('hasPermission', () => {
    it('should return default permission if ld has not ready', async () => {
      const controller = new LaunchDarklyController();
      expect(
        await controller.hasPermission('JUPITER_CREATE_TEAM'),
      ).toBeTruthy();
      expect(await controller.hasPermission('CAN_MENTION_TEAM')).toBeFalsy();
      expect(
        await controller.hasPermission('LEFT_RAIL_MAX_COUNT'),
      ).toBeTruthy();
    });
  });
  describe('getFeatureFlag', () => {
    it('should return default value if ld has not ready', async () => {
      const controller = new LaunchDarklyController();
      expect(
        await controller.getFeatureFlag('JUPITER_CREATE_TEAM'),
      ).toBeTruthy();
      expect(await controller.getFeatureFlag('CAN_MENTION_TEAM')).toBeFalsy();
      expect(await controller.getFeatureFlag('LEFT_RAIL_MAX_COUNT')).toEqual(
        80,
      );
    });
  });
  describe('isFlagSupported', () => {
    it('should return true if the feature is controlled by ld', () => {
      const controller = new LaunchDarklyController();
      expect(controller.isFlagSupported('JUPITER_CREATE_TEAM')).toBeTruthy();
    });
    it('should return true if the feature is not controlled by ld', () => {
      const controller = new LaunchDarklyController();
      expect(controller.isFlagSupported('TEST_ONE')).toBeFalsy();
    });
  });
});
