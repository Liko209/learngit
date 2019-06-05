/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-03-27 16:26:41
 * Copyright © RingCentral. All rights reserved.
 */
import { CompanyEntityCacheController } from '../CompanyEntityCacheController';
import { AccountUserConfig } from '../../../account/config/AccountUserConfig';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

jest.mock('../../../account/config/AccountUserConfig', () => {
  const xx = {
    getCurrentCompanyId: jest.fn(),
  };
  return {
    AccountUserConfig: () => {
      return xx;
    },
  };
});

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('CompanyEntityCacheController', () => {
  let companyEntityCacheController: CompanyEntityCacheController;
  let accountUserConfig: AccountUserConfig;
  function setUp() {
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.ACCOUNT_SERVICE) {
          return { userConfig: accountUserConfig };
        }
      });
    accountUserConfig = new AccountUserConfig();
    companyEntityCacheController = new CompanyEntityCacheController();
    accountUserConfig.getCurrentCompanyId = jest.fn().mockReturnValue(111);
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('clear', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should delete cached company id when clear', async () => {
      const entities = new Map([[1, 1]]);
      Object.assign(companyEntityCacheController, {
        _entities: entities,
      });
      await companyEntityCacheController.clear();
      expect(entities.size).toBe(0);
    });
  });

  describe('cache, initialize', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('only cache company of current user', () => {
      const entitiesCache: Map<number, any> = new Map();
      Object.assign(companyEntityCacheController, {
        _entities: entitiesCache,
      });

      const entities: any = new Map([[1, { id: 1 }], [111, { id: 111 }]]);
      companyEntityCacheController.initialize(entities);

      expect(entitiesCache.size).toBe(1);
    });
  });
});
