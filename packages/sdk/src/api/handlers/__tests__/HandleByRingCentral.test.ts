import { OAuthTokenHandler, NETWORK_METHOD, NetworkRequestBuilder } from 'foundation';
import { stringify } from 'qs';
import HandleByRingCentral from '../HandleByRingCentral';
const handler = new OAuthTokenHandler(HandleByRingCentral, null);

jest.mock('../../api');

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
    expect(HandleByRingCentral.tokenRefreshable).toBeTruthy();
    expect(HandleByRingCentral.tokenExpirable).toBeTruthy();
    expect(HandleByRingCentral.tokenRefreshable).toBeTruthy();
    expect(HandleByRingCentral.basic()).toEqual(btoa('rc_id:rc_secret'));
  });

  describe('requestDecoration', () => {
    it('should add basic token to params if needAuth is false', () => {
      handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => true);
      handler.accessToken = jest.fn().mockImplementation(() => 'token');
      handler.getBasic = jest.fn().mockImplementation(() => 'basic');
      const decoration = HandleByRingCentral.requestDecoration(handler);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => false);
      const decoratedRequest = decoration(request);
      expect(decoratedRequest.headers.Authorization).toEqual('Basic basic');
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
      handler.getBasic = jest.fn().mockImplementation(() => 'basic');
      const decoration = HandleByRingCentral.requestDecoration(handler);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => false);
      const decoratedRequest = decoration(request);
      expect(decoratedRequest.headers.Authorization).toEqual('Basic basic');
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
      handler.getBasic = jest.fn().mockImplementation(() => 'basic');
      const decoration = HandleByRingCentral.requestDecoration(handler);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => true);
      const decoratedRequest = decoration(request);
      expect(decoratedRequest.headers.Authorization).toEqual('Basic basic');
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
});
