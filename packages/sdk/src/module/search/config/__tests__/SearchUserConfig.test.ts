/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-01 13:12:26
 * Copyright © RingCentral. All rights reserved.
 */

import { SearchUserConfig } from '../SearchUserConfig';
import { AccountGlobalConfig } from '../../../../service/account/config';
import { UserConfigService } from '../../../config/service/UserConfigService';
import { SEARCH_CONFIG_KEYS } from '../configKeys';

jest.mock('../../../config/service/UserConfigService');
jest.mock('../../../../service/account/config');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('SearchUserConfig', () => {
  let searchUserConfig: SearchUserConfig;
  let userConfigService: UserConfigService;
  function setUp() {
    userConfigService = new UserConfigService();
    userConfigService.setUserId = jest.fn();
    UserConfigService.getInstance = jest
      .fn()
      .mockReturnValue(userConfigService);

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

    it('setRecentSearchRecords', () => {
      const data: any = {};
      searchUserConfig.setRecentSearchRecords([data]);
      expect(userConfigService.put).toBeCalledWith(
        SearchUserConfig.moduleName,
        SEARCH_CONFIG_KEYS.RECENT_SEARCH_RECORDS,
        [data],
      );
    });

    it('getRecentSearchRecords', () => {
      const data: any = [{}];
      userConfigService.get = jest.fn().mockImplementation(() => {
        return data;
      });
      const res = searchUserConfig.getRecentSearchRecords();
      expect(res).toEqual(data);
    });
  });
});
