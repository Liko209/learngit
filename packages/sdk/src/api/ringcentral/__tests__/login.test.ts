/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-17 18:11:46
 * Copyright © RingCentral. All rights reserved.
 */
import Api from '../../api';
import {
  loginRCByPassword,
  loginGlip2ByPassword,
  refreshToken,
} from '../login';
import { NETWORK_VIA } from 'foundation';
import { NetworkRequestExecutor } from 'foundation/src/network/NetworkRequestExecutor';

jest.mock('../../api');
jest.mock('foundation/src/network/NetworkRequestExecutor');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('login', () => {
  beforeEach(() => {
    clearMocks();
  });

  describe('loginRCByPassword()', () => {
    it('rcNetworkClient http() should be called with specific path', () => {
      loginRCByPassword({ username: 'aaa', password: '123' });
      expect(Api.rcNetworkClient.http).toHaveBeenCalledWith({
        authFree: true,
        data: { grant_type: 'password', password: '123', username: 'aaa' },
        method: 'post',
        path: '/oauth/token',
        via: NETWORK_VIA.HTTP,
      });
    });
  });
  describe('loginGlip2ByPassword()', () => {
    it('glip2NetworkClient http() should be called with specific path', () => {
      loginGlip2ByPassword({ username: 'aaa', password: '123' });
      expect(Api.glip2NetworkClient.http).toHaveBeenCalledWith({
        authFree: true,
        data: { grant_type: 'password', password: '123', username: 'aaa' },
        method: 'post',
        path: '/oauth/token',
        via: NETWORK_VIA.HTTP,
      });
    });
  });

  describe('refreshToken()', () => {
    const handlerType = {
      basic: jest.fn().mockReturnValue('basic'),
    };

    const networkManager: any = {
      clientManager: { getApiClient: jest.fn() },
    };

    const token: any = {
      refresh_token: 'refresh_token',
      access_token: 'access_token',
    };

    const retRequest: any = {
      handlerType,
      callback: undefined,
      headers: { Authorization: undefined },
    };

    beforeEach(() => {
      clearMocks();
      Api.rcNetworkClient.networkManager = networkManager;
      Api.rcNetworkClient.getRequestByVia.mockReturnValue(retRequest);
    });

    it('should throw when get wrong error', async () => {
      const response = { status: 400, statusText: 'erroroooo' };
      const promise = refreshToken(token);
      setTimeout(() => {
        retRequest.callback(response);
      },         10);
      await expect(promise).rejects.toBeInstanceOf(Error);
    });

    it('should call right path and return token data ', async () => {
      const promise = refreshToken(token);
      const response = { status: 200, data: '123123' };
      setTimeout(() => {
        retRequest.callback(response);
      },         10);
      const retVal = await promise;
      expect(retVal).toEqual(response.data);
      expect(
        Api.rcNetworkClient.networkManager.clientManager.getApiClient,
      ).toBeCalled();
      expect(Api.rcNetworkClient.getRequestByVia).toHaveBeenCalledWith(
        {
          authFree: true,
          data: {
            access_token: 'access_token',
            grant_type: 'refresh_token',
            refresh_token: 'refresh_token',
          },
          method: 'post',
          via: NETWORK_VIA.HTTP,
          path: '/oauth/token',
        },
        NETWORK_VIA.HTTP,
      );
    });
  });
});
