/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-01 13:12:26
 * Copyright © RingCentral. All rights reserved.
 */

import { SearchUserConfig } from '../SearchUserConfig';
import { AccountGlobalConfig } from '../../../../module/account/config';
import { DBConfigService } from '../../../config/service/DBConfigService';
import { SEARCH_CONFIG_KEYS } from '../constants';
import { ServiceLoader } from '../../../serviceLoader';

jest.mock('../../../config/service/DBConfigService');
jest.mock('../../../../module/account/config');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('SearchUserConfig', () => {
  let searchUserConfig: SearchUserConfig;
  let dbConfigService: DBConfigService;
  function setUp() {
    dbConfigService = new DBConfigService();
    dbConfigService.setUserId = jest.fn();
    ServiceLoader.getInstance = jest.fn().mockReturnValue(dbConfigService);

    AccountGlobalConfig.getCurrentUserId = jest.fn().mockReturnValue(222);
    searchUserConfig = new SearchUserConfig();
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('SEARCH_CONFIG_KEYS.RECENT_SEARCH_RECORDS', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('setRecentSearchRecords', async () => {
      const data: any = {};
      await searchUserConfig.setRecentSearchRecords([data]);
      expect(dbConfigService.put).toBeCalledWith(
        SearchUserConfig.moduleName,
        SEARCH_CONFIG_KEYS.RECENT_SEARCH_RECORDS,
        [data],
      );
    });

    it('getRecentSearchRecords', async () => {
      const data: any = [{}];
      dbConfigService.get = jest.fn().mockImplementation(() => {
        return data;
      });
      const res = await searchUserConfig.getRecentSearchRecords();
      expect(res).toEqual(data);
    });
  });
});
