/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-24 09:59:10
 * Copyright © RingCentral. All rights reserved.
 */

import { LaunchDarklyController } from '../LaunchDarklyController';
import { LaunchDarklyClient } from '../LaunchDarklyClient';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountUserConfig } from 'sdk/module/account/config/AccountUserConfig';
import { AuthUserConfig } from 'sdk/module/account/config/AuthUserConfig';
import { EnvConfig } from 'sdk/module/env/config';
import { Api } from 'sdk/api';


jest.mock('../LaunchDarklyClient')
jest.mock('sdk/module/account/config/AccountUserConfig');
jest.mock('sdk/module/account/config/AuthUserConfig');
jest.mock('sdk/module/env/config');
jest.mock('sdk/api');

describe('LaunchDarklyController', () => {
  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }

  describe('setCallback', () => {
    it('callback should be undefined when setCallback is not called', () => {
      const controller = new LaunchDarklyController();
      expect(controller['launchDarklyCallback']).toBeUndefined();
    });
    it('callback should not be undefined when setCallback is not called', () => {
      const controller = new LaunchDarklyController();
      controller.setCallback(() => { });
      expect(controller['launchDarklyCallback']).not.toBeUndefined();
    });
  });
  describe('initClient', () => {
    let accountUserConfig: AccountUserConfig;
    let getById = jest.fn();
    let getSynchronously = jest.fn();
    function setUp() {
      ServiceLoader.getInstance = jest
        .fn()
        .mockImplementation((config: string) => {
          if (config === ServiceConfig.ACCOUNT_SERVICE) {
            return { userConfig: accountUserConfig };
          }
          if (config === ServiceConfig.PERSON_SERVICE) {
            return {
              getById,
              getSynchronously,
            }
          }
        });
      accountUserConfig = new AccountUserConfig();
    }
    beforeEach(() => {
      clearMocks();
      setUp();
    });
    it('client should be undefined when is is init ing', async () => {
      const controller = new LaunchDarklyController();
      controller['isIniting'] = true;
      await controller.initClient();
      expect(controller['launchDarklyClient']).toBeUndefined();
    });
    it('client should be undefined when there is not user id', async () => {
      const controller = new LaunchDarklyController();
      accountUserConfig.getGlipUserId = jest.fn().mockReturnValueOnce(undefined);
      await controller.initClient();
      expect(controller['launchDarklyClient']).toBeUndefined();
    });

    it('client should be undefined when is running e2e', async () => {
      const controller = new LaunchDarklyController();
      accountUserConfig.getGlipUserId = jest.fn().mockReturnValueOnce(1);
      getById.mockReturnValueOnce({});
      getSynchronously.mockReturnValueOnce({});
      EnvConfig.getIsRunningE2E = jest.fn().mockReturnValueOnce(true);
      Api = {
        httpConfig: {
          launchdarkly: {
            clientId: '1'
          }
        }
      }
      await controller.initClient();
      expect(controller['launchDarklyClient']).toBeUndefined();
    });

    it('client should be undefined when has not client id', async () => {
      const controller = new LaunchDarklyController();
      accountUserConfig.getGlipUserId = jest.fn().mockReturnValueOnce(1);
      getById.mockReturnValueOnce({});
      EnvConfig.getIsRunningE2E = jest.fn().mockReturnValueOnce(false);
      Api = {
        httpConfig: {
          launchdarkly: {
            clientId: ''
          }
        }
      }
      await controller.initClient();
      expect(controller['launchDarklyClient']).toBeUndefined();
    });

    it('should create a new client when all parameters are ready', async () => {
      const controller = new LaunchDarklyController();
      accountUserConfig.getGlipUserId = jest.fn().mockReturnValueOnce(1);
      getById.mockReturnValueOnce({});
      EnvConfig.getIsRunningE2E = jest.fn().mockReturnValueOnce(false);
      Api = {
        httpConfig: {
          launchdarkly: {
            clientId: '1'
          }
        }
      }
      await controller.initClient();
      expect(controller['launchDarklyClient']).not.toBeUndefined();
    })


  });

  describe('shutdownClient', () => {
    it('should clear all data', () => {
      const controller = new LaunchDarklyController();
      const shutdown = jest.fn();
      controller['launchDarklyClient'] = {
        shutdown,
      }
      controller['isIniting'] = true;
      expect(controller['isIniting']).toBeTruthy();

      controller.shutdownClient(true);
      expect(controller['isIniting']).toBeFalsy();
      expect(shutdown).toHaveBeenCalled();

    });
  });
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
