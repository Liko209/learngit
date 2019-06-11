/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-30 17:48:20
 * Copyright © RingCentral. All rights reserved.
 */

import { RcSubscriptionApi } from '../RcSubscriptionApi';

jest.mock('../../api');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RcSubscriptionApi', () => {
  function setUp() {}
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('createSubscription', () => {
    it('should be called with correct params', async () => {
      const params: any = {
        eventFilters: ['1', '2'],
        deliveryMode: { transportType: 1, encryption: true },
      };
      await RcSubscriptionApi.createSubscription(params);

      expect(RcSubscriptionApi.rcNetworkClient.http).toBeCalledWith({
        authFree: false,
        data: params,
        headers: { 'Content-Type': 'application/json' },
        method: 'post',
        path: '/v1.0/subscription',
        retryCount: 3,
        via: 0,
      });
    });
  });

  describe('renewSubscription', () => {
    it('should be called with correct params', async () => {
      await RcSubscriptionApi.renewSubscription('sub_id');
      expect(RcSubscriptionApi.rcNetworkClient.http).toBeCalledWith({
        authFree: false,
        method: 'post',
        path: '/v1.0/subscription/sub_id/renew',
        retryCount: 3,
        via: 0,
      });
    });
  });

  describe('updateSubscription', () => {
    it('should be called with correct params', async () => {
      await RcSubscriptionApi.updateSubscription('sub_id', {
        event: [],
      } as any);
      expect(RcSubscriptionApi.rcNetworkClient.http).toBeCalledWith({
        authFree: false,
        data: { event: [] },
        headers: { 'Content-Type': 'application/json' },
        method: 'put',
        path: '/v1.0/subscription/sub_id',
        retryCount: 3,
        via: 0,
      });
    });
  });

  describe('cancelSubscription', () => {
    it('should be called with correct params', async () => {
      await RcSubscriptionApi.cancelSubscription('sub_id');
      expect(RcSubscriptionApi.rcNetworkClient.http).toBeCalledWith({
        authFree: false,
        method: 'delete',
        path: '/v1.0/subscription/sub_id',
        retryCount: 3,
        via: 0,
      });
    });
  });

  describe('getSubscription', () => {
    it('should be called with correct params', async () => {
      await RcSubscriptionApi.getSubscription('sub_id');
      expect(RcSubscriptionApi.rcNetworkClient.http).toBeCalledWith({
        authFree: false,
        method: 'get',
        path: '/v1.0/subscription/sub_id',
        retryCount: 3,
        via: 0,
      });
    });
  });
});
