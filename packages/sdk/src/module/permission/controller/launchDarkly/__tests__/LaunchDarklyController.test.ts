/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-18 17:05:52
 * Copyright © RingCentral. All rights reserved.
 */

import { LaunchDarklyClient } from '../LaunchDarklyClient';
import { LaunchDarklyController } from '../LaunchDarklyController';
import { notificationCenter } from '../../../../../service';
import UserPermissionType from '../../../types';

LaunchDarklyClient.prototype.hasPermission = (type: UserPermissionType) => {
  const result = type === UserPermissionType.JUPITER_CREATE_TEAM;
  return result;
};

LaunchDarklyClient.prototype.hasFlags = () => {
  return true;
};

jest.mock('../LaunchDarklyClient');
jest.mock('../../../../../service');

describe('LaunchDarklyController', () => {
  describe('constructor', () => {
    it('should call notificationCenter.on three times', () => {
      new LaunchDarklyController(() => {});
      expect(notificationCenter.on).toHaveBeenCalledTimes(3);
    });
  });
  describe('hasPermission', () => {
    it('should return local default value when LaunchDarkly is not ready', () => {
      const controller = new LaunchDarklyController(() => {});
      let permission = controller.hasPermission(
        UserPermissionType.JUPITER_CREATE_TEAM,
      );
      expect(permission).toBeTruthy();
      permission = controller.hasPermission(
        UserPermissionType.JUPITER_SEND_NEW_MESSAGE,
      );
      expect(permission).toBeTruthy();
      permission = controller.hasPermission(
        UserPermissionType.JUPITER_CAN_SAVE_LOG,
      );
      expect(permission).toBeFalsy();
      permission = controller.hasPermission(
        UserPermissionType.JUPITER_CAN_UPLOAD_LOG,
      );
      expect(permission).toBeFalsy();
    });
    it('should return launchDarkly value when LaunchDarkly is  ready', () => {
      const controller = new LaunchDarklyController(() => {});
      Object.assign(controller, {
        isClientReady: true,
        launchDarklyClient: new LaunchDarklyClient({}),
      });
      let result = controller.hasPermission(
        UserPermissionType.JUPITER_CREATE_TEAM,
      );
      expect(result).toBeTruthy();
      result = controller.hasPermission(
        UserPermissionType.JUPITER_SEND_NEW_MESSAGE,
      );
      expect(result).toBeFalsy();
    });
  });
});
