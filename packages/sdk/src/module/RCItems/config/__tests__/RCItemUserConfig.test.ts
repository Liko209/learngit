/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-28 13:55:39
 * Copyright © RingCentral. All rights reserved.
 */

import { RCItemUserConfig } from '../RCItemUserConfig';
import { DBConfigService } from 'sdk/module/config/service/DBConfigService';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { RC_ITEM_CONFIG_KEYS } from '../constants';
import { daoManager } from 'sdk/dao';

jest.mock('sdk/dao');
jest.mock('sdk/module/config/service/DBConfigService');
jest.mock('sdk/module/serviceLoader');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RCItemUserConfig', () => {
  const MODULE_NAME = 'RCItem';
  let rcItemUserConfig: RCItemUserConfig;
  let dbConfigService: DBConfigService;
  function setUp() {
    dbConfigService = new DBConfigService();
    ServiceLoader.getInstance = jest.fn().mockReturnValue(dbConfigService);
    rcItemUserConfig = new RCItemUserConfig(MODULE_NAME);
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('RC_ITEM_CONFIG_KEYS.SYNC_TOKEN', () => {
    it('setSyncToken', async () => {
      await rcItemUserConfig.setSyncToken('token');
      expect(dbConfigService.put).toBeCalledWith(
        MODULE_NAME,
        RC_ITEM_CONFIG_KEYS.SYNC_TOKEN,
        'token',
      );
    });

    it('getSyncToken', async () => {
      await rcItemUserConfig.getSyncToken();
      expect(dbConfigService.get).toBeCalledWith(
        MODULE_NAME,
        RC_ITEM_CONFIG_KEYS.SYNC_TOKEN,
      );
    });

    it('removeSyncToken', async () => {
      await rcItemUserConfig.removeSyncToken();
      expect(dbConfigService.remove).toBeCalledWith(
        MODULE_NAME,
        RC_ITEM_CONFIG_KEYS.SYNC_TOKEN,
      );
    });
  });

  describe('RC_ITEM_CONFIG_KEYS.HAS_MORE_IN_REMOTE', () => {
    it('setHasMore', async () => {
      await rcItemUserConfig.setHasMore(true);
      expect(dbConfigService.put).toBeCalledWith(
        MODULE_NAME,
        RC_ITEM_CONFIG_KEYS.HAS_MORE_IN_REMOTE,
        true,
      );
    });

    it('getHasMore', async () => {
      await rcItemUserConfig.getHasMore();
      expect(dbConfigService.get).toBeCalledWith(
        MODULE_NAME,
        RC_ITEM_CONFIG_KEYS.HAS_MORE_IN_REMOTE,
      );
    });

    it('removeHasMore', async () => {
      await rcItemUserConfig.removeHasMore();
      expect(dbConfigService.remove).toBeCalledWith(
        MODULE_NAME,
        RC_ITEM_CONFIG_KEYS.HAS_MORE_IN_REMOTE,
      );
    });
  });
});
