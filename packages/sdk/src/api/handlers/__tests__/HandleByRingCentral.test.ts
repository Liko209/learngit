import {
  OAuthTokenHandler,
  NETWORK_METHOD,
  NetworkRequestBuilder,
} from 'foundation';
import { stringify } from 'qs';
import HandleByRingCentral from '../HandleByRingCentral';
import { AccountService } from '../../../module/account';
import { AccountManager } from '../../../framework';
import { ServiceLoader } from '../../../module/serviceLoader';
import { ApiConfiguration } from '../../config';
const handler = new OAuthTokenHandler(HandleByRingCentral, null);

const accountManager: AccountManager = new AccountManager(null);
const accountService: AccountService = new AccountService(accountManager);
ServiceLoader.getInstance = jest.fn().mockReturnValue(accountService);
const postRequest = () => {
  return new NetworkRequestBuilder()
    .setPath('/')
    .setData({
      username: 'test',
    })
    .setParams({
      password: 'aaa',
    })
    .setHeaders({
      tk: 'sdfsdfadfss',
    })
    .setMethod(NETWORK_METHOD.POST)
    .setAuthfree(true)
    .setRequestConfig({})
    .build();
};

describe('HandleByRingCentral', () => {
  it('tokenRefreshable is true and generate basic according to Api.httpConfig', () => {
    ApiConfiguration.setApiConfig({
      rc: { clientId: 'rc_id' },
    });
    expect(HandleByRingCentral.tokenRefreshable).toBeTruthy();
    expect(HandleByRingCentral.tokenExpirable).toBeTruthy();
    expect(HandleByRingCentral.tokenRefreshable).toBeTruthy();
    expect(HandleByRingCentral.basic()).toEqual('');
  });

  describe('requestDecoration', () => {
    it('should add basic token to params if needAuth is false', () => {
      handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => true);
      handler.accessToken = jest.fn().mockImplementation(() => 'token');
      const decoration = HandleByRingCentral.requestDecoration(handler);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => false);
      const decoratedRequest = decoration(request);
      expect(decoratedRequest.data).toEqual(
        stringify({
          username: 'test',
        }),
      );
    });

    // tslint:disable-next-line:max-line-length
    it('should add basic token to params if needAuth is false and isOAuthTokenAvailable is false', () => {
      handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => false);
      handler.accessToken = jest.fn().mockImplementation(() => 'token');
      const decoration = HandleByRingCentral.requestDecoration(handler);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => false);
      const decoratedRequest = decoration(request);
      expect(decoratedRequest.data).toEqual(
        stringify({
          username: 'test',
        }),
      );
    });

    it('should add Bareea token to headers if needAuth is true', () => {
      handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => true);
      handler.accessToken = jest.fn().mockImplementation(() => 'token');
      const decoration = HandleByRingCentral.requestDecoration(handler);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => true);
      const decoratedRequest = decoration(request);
      expect(decoratedRequest.headers.Authorization).toEqual('Bearer token');
      expect(decoratedRequest.data).toEqual({
        username: 'test',
      });
    });

    it('should add Bareea token to headers if isOAuthTokenAvailable is false', () => {
      handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => false);
      handler.accessToken = jest.fn().mockImplementation(() => 'token');
      const decoration = HandleByRingCentral.requestDecoration(handler);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => true);
      const decoratedRequest = decoration(request);
      expect(decoratedRequest.data).toEqual(
        stringify({
          username: 'test',
        }),
      );
    });

    it('should add Bareea token to headers if needAuth is true', () => {
      handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => true);
      handler.accessToken = jest.fn().mockImplementation(() => 'token');
      handler.getBasic = jest.fn().mockImplementation(() => 'basic');
      const decoration = HandleByRingCentral.requestDecoration(null);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => true);
      expect(decoration).toThrow();
    });

    it('should not add any token to headers if Authorization existed', () => {
      handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => true);
      handler.accessToken = jest.fn().mockImplementation(() => 'token');
      handler.getBasic = jest.fn().mockImplementation(() => 'basic');
      const decoration = HandleByRingCentral.requestDecoration(handler);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => true);
      request.headers.Authorization = 'Authorization';
      const decoratedRequest = decoration(request);
      expect(decoratedRequest.headers.Authorization).toEqual('Authorization');
      expect(decoratedRequest.data).toEqual({
        username: 'test',
      });
    });
  });

  describe('refreshToken', () => {
    it('should reject if refresh fail', async () => {
      expect.assertions(1);
      HandleByRingCentral.platformHandleDelegate = {
        refreshRCToken: jest.fn().mockRejectedValueOnce('502'),
      };
      const originToken = {
        timestamp: 0,
        expires_in: 6000,
        refresh_token_expires_in: 6000,
      };
      const refreshToken = HandleByRingCentral.doRefreshToken(originToken);
      await expect(refreshToken).rejects.toEqual('502');
    });

    it('should resolve if refresh success', async () => {
      expect.assertions(1);

      const fakeToken = {
        timestamp: 1,
        expires_in: 6001,
        refresh_token_expires_in: 6001,
        access_token: 'accessToken',
        refresh_token: 'refreshToken',
      };
      HandleByRingCentral.platformHandleDelegate = {
        refreshRCToken: jest.fn().mockResolvedValueOnce(fakeToken),
      };
      const originToken = {
        timestamp: 0,
        expires_in: 6000,
        refresh_token_expires_in: 6000,
      };
      const refreshToken = HandleByRingCentral.doRefreshToken(originToken);
      await expect(refreshToken).resolves.toEqual({
        expires_in: 6001,
        access_token: 'accessToken',
        refresh_token: 'refreshToken',
        refresh_token_expires_in: 6001,
        timestamp: 1,
      });
    });
  });
});
