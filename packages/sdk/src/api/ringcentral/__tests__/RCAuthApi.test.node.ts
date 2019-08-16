/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-28 16:40:55
 * Copyright © RingCentral. All rights reserved.
 */

import { RCAuthApi } from '../RCAuthApi';
import { NETWORK_VIA, NETWORK_METHOD, HA_PRIORITY } from 'foundation/network';
import { ApiConfiguration } from '../../config';

jest.mock('../../api');
jest.mock('foundation/network/NetworkRequestExecutor');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RCAuthApi', () => {
  beforeEach(() => {
    clearMocks();
  });

  describe('oauthTokenViaAuthCode()', () => {
    it('glipNetworkClient http() should be called with specific path', () => {
      RCAuthApi.oauthTokenViaAuthCode({ name: 'aaa' }, { auth: 'xxxx' });
      expect(RCAuthApi.rcNetworkClient.http).toHaveBeenCalledWith({
        authFree: true,
        data: {
          grant_type: 'authorization_code',
          name: 'aaa',
          client_id: '',
        },
        headers: { auth: 'xxxx' },
        method: 'post',
        via: NETWORK_VIA.HTTP,
        path: '/oauth/token',
      });
    });
  });

  describe('loginRCByPassword()', () => {
    it('rcNetworkClient http() should be called with specific path', () => {
      RCAuthApi.loginRCByPassword({ username: 'aaa', password: '123' });
      expect(RCAuthApi.rcNetworkClient.http).toHaveBeenCalledWith({
        authFree: true,
        data: { grant_type: 'password', password: '123', username: 'aaa' },
        method: 'post',
        path: '/oauth/token',
        via: NETWORK_VIA.HTTP,
      });
    });
  });
  describe('refreshToken()', () => {
    it('should be called with specific path', () => {
      const token: any = {
        refresh_token: 'refresh_token',
        access_token: 'access_token',
        endpoint_id: 'endpoint_id',
        test_field: 'test_field',
      };
      RCAuthApi.refreshToken(token);
      expect(RCAuthApi.rcNetworkClient.http).toHaveBeenCalledWith({
        authFree: true,
        data: {
          refresh_token: token.refresh_token,
          endpoint_id: token.endpoint_id,
          grant_type: 'refresh_token',
          client_id: ApiConfiguration.apiConfig.rc.clientId,
        },
        method: 'post',
        path: '/oauth/token',
        via: NETWORK_VIA.HTTP,
        priority: 0,
      });
    });
  });

  describe('generateRCCode', () => {
    it('should be called with correct params', () => {
      RCAuthApi.generateRCCode('clienid', 100);
      expect(RCAuthApi.rcNetworkClient.http).toHaveBeenCalledWith({
        path: '/v1.0/interop/generate-code',
        method: 'post',
        via: NETWORK_VIA.HTTP,
        data: { clientId: 'clienid', ttl: 100 },
      });
    });
  });

  describe('requestServerStatus()', () => {
    const mockRequest = {};
    it('should call callback with true when request success', () => {
      RCAuthApi.rcNetworkClient.getRequestByVia.mockReturnValue(mockRequest);
      RCAuthApi.rcNetworkClient.networkManager = {
        addApiRequest: jest.fn().mockImplementation(({ callback }) => {
          callback({ status: 200 });
        }),
      } as any;
      const mockCallBack = jest.fn();
      RCAuthApi.requestServerStatus(mockCallBack);
      expect(RCAuthApi.rcNetworkClient.getRequestByVia).toHaveBeenCalledWith(
        {
          path: '/v1.0/status',
          method: NETWORK_METHOD.GET,
          authFree: true,
          via: NETWORK_VIA.HTTP,
          HAPriority: HA_PRIORITY.HIGH,
        },
        NETWORK_VIA.HTTP,
      );
      expect(mockCallBack).toHaveBeenCalledWith(true, 0);
    });

    it('should call callback with true when request success', () => {
      RCAuthApi.rcNetworkClient.getRequestByVia.mockReturnValue(mockRequest);
      RCAuthApi.rcNetworkClient.networkManager = {
        addApiRequest: jest.fn().mockImplementation(({ callback }) => {
          callback({
            status: 500,
            headers: {
              'Retry-After': 20,
            },
          });
        }),
      } as any;
      const mockCallBack = jest.fn();
      RCAuthApi.requestServerStatus(mockCallBack);
      expect(RCAuthApi.rcNetworkClient.getRequestByVia).toHaveBeenCalledWith(
        {
          path: '/v1.0/status',
          method: NETWORK_METHOD.GET,
          authFree: true,
          via: NETWORK_VIA.HTTP,
          HAPriority: HA_PRIORITY.HIGH,
        },
        NETWORK_VIA.HTTP,
      );
      expect(mockCallBack).toHaveBeenCalledWith(false, 20);
    });
  });
});
