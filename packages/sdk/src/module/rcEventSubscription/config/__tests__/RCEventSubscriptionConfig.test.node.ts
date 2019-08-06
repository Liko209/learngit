/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-30 20:37:05
 * Copyright © RingCentral. All rights reserved.
 */
import { RCEventSubscriptionConfig } from '../RCEventSubscriptionConfig';
import { DBConfigService } from 'sdk/module/config/service/DBConfigService';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('sdk/dao');
jest.mock('sdk/module/config/service/DBConfigService');
jest.mock('sdk/module/serviceLoader');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RCEventSubscriptionConfig', () => {
  let rcEventSubscriptionConfig: RCEventSubscriptionConfig;
  let dbConfigService: DBConfigService;
  function setUp() {
    dbConfigService = new DBConfigService();
    ServiceLoader.getInstance = jest.fn().mockReturnValue(dbConfigService);
    rcEventSubscriptionConfig = new RCEventSubscriptionConfig();
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('RC_SUBSCRIPTION_KEYS.SUBSCRIPTION_INFO', () => {
    it('should call put when call setRcEventSubscription ', async () => {
      await rcEventSubscriptionConfig.setRcEventSubscription({ id: 1 } as any);
      expect(dbConfigService.put).toBeCalledWith(
        'rcSubscription',
        'subscriptionInfo',
        { id: 1 },
      );
    });

    it('should call put when call getRcEventSubscription ', async () => {
      await rcEventSubscriptionConfig.getRcEventSubscription();
      expect(dbConfigService.get).toBeCalledWith(
        'rcSubscription',
        'subscriptionInfo',
      );
    });

    it('should call remove when call deleteRcEventSubscription ', async () => {
      await rcEventSubscriptionConfig.deleteRcEventSubscription();
      expect(dbConfigService.remove).toBeCalledWith(
        'rcSubscription',
        'subscriptionInfo',
      );
    });
  });
});
