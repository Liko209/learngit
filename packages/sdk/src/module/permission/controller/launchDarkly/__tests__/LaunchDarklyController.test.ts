/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-18 17:05:52
 * Copyright © RingCentral. All rights reserved.
 */

import { LaunchDarklyClient } from '../LaunchDarklyClient';
import { LaunchDarklyController } from '../LaunchDarklyController';
import { notificationCenter, SERVICE } from '../../../../../service';
import UserPermissionType from '../../../types';
import { Api } from 'sdk/api';
import { EnvConfig } from 'sdk/module/env/config';
jest.mock('sdk/module/env/config');
jest.mock('../LaunchDarklyClient');
jest.mock('../../../../../service');
LaunchDarklyClient.prototype.hasPermission = (type: UserPermissionType) => {
  const result = type === UserPermissionType.JUPITER_CREATE_TEAM;
  return result;
};

LaunchDarklyClient.prototype.hasFlags = () => {
  return true;
};

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}
describe('LaunchDarklyController', () => {
  let controller: LaunchDarklyController;
  function setUp() {
    controller = new LaunchDarklyController(() => {});
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });
  describe('constructor', () => {
    it('should call notificationCenter.on three times', () => {
      expect(notificationCenter.on).toHaveBeenCalledTimes(4);
    });
  });
  describe('hasPermission', () => {
    it('should return local default value when LaunchDarkly is not ready', () => {
      let permission = controller.hasPermission(
        UserPermissionType.JUPITER_CREATE_TEAM,
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

  describe('emit change', () => {
    it('should', (done: jest.DoneCallback) => {
      Api.httpConfig.launchdarkly = {
        clientId: '1',
      };
      EnvConfig.getDisableLD = jest.fn().mockReturnValue(false);
      notificationCenter.emit(SERVICE.LOGIN);
      setTimeout(() => {
        expect(controller.getDisableLD).toBeUndefined();
        done();
      });
    });
  });
});
