/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 16:39:53
 * Copyright © RingCentral. All rights reserved.
 */

import { RcInfoApi } from '../RcInfoApi';
import { NETWORK_VIA, HA_PRIORITY } from 'foundation';

jest.mock('../../api');

describe('RcInfoApi', () => {
  describe('requestRcClientInfo()', () => {
    it('should be called with correct params', () => {
      RcInfoApi.requestRcClientInfo();
      expect(RcInfoApi.rcNetworkClient.http).toBeCalledWith({
        path: '/v1.0/client-info',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('requestRcAPIVersion()', () => {
    it('should be called with correct params', () => {
      RcInfoApi.requestRcAPIVersion();
      expect(RcInfoApi.rcNetworkClient.http).toBeCalledWith({
        path: '',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
      });
    });
  });

  describe('requestRcAccountInfo()', () => {
    it('should be called with correct params', () => {
      RcInfoApi.requestRcAccountInfo();
      expect(RcInfoApi.rcNetworkClient.http).toBeCalledWith({
        path: '/v1.0/account/~',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('requestRcExtensionInfo()', () => {
    it('should be called with correct params', () => {
      RcInfoApi.requestRcExtensionInfo();
      expect(RcInfoApi.rcNetworkClient.http).toBeCalledWith({
        path: '/v1.0/account/~/extension/~',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('requestRcRolePermission()', () => {
    it('should be called with correct params', () => {
      RcInfoApi.requestRcRolePermissions();
      expect(RcInfoApi.rcNetworkClient.http).toBeCalledWith({
        path: '/v1.0/account/~/extension/~/authz-profile',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });
});
