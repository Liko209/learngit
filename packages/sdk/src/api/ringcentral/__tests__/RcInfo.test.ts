/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 16:39:53
 * Copyright © RingCentral. All rights reserved.
 */

import Api from '../../api';
import { RcInfoApi } from '../RcInfo';
import { NETWORK_VIA } from 'foundation';

jest.mock('../../api');

describe('RcInfo', () => {
  describe('requestRcClientInfo()', () => {
    it('should be called with correct params', () => {
      RcInfoApi.requestRcClientInfo();
      expect(Api.rcNetworkClient.http).toBeCalledWith({
        path: '/v1.0/client-info',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
      });
    });
  });

  describe('requestRcAccountInfo()', () => {
    it('should be called with correct params', () => {
      RcInfoApi.requestRcAccountInfo();
      expect(Api.rcNetworkClient.http).toBeCalledWith({
        path: '/v1.0/account/~',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
      });
    });
  });

  describe('requestRcExtensionInfo()', () => {
    it('should be called with correct params', () => {
      RcInfoApi.requestRcExtensionInfo();
      expect(Api.rcNetworkClient.http).toBeCalledWith({
        path: '/v1.0/account/~/extension/~',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
      });
    });
  });

  describe('requestRcRolePermission()', () => {
    it('should be called with correct params', () => {
      RcInfoApi.requestRcRolePermission();
      expect(Api.rcNetworkClient.http).toBeCalledWith({
        path: '/v1.0/account/~/extension/~/authz-profile',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
      });
    });
  });
});
