import { OAuthTokenHandler, NETWORK_METHOD, NetworkRequestBuilder } from 'foundation';
jest.mock('foundation');
import HandleByGlip2 from '../HandleByGlip2';
import { stringify } from 'qs';
const handler = new OAuthTokenHandler(HandleByGlip2, null);

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
describe('HandleByGlip2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('tokenRefreshable is true and generate basic according to Api.httpConfig', () => {
    expect(HandleByGlip2.tokenRefreshable).toBeTruthy();
    expect(HandleByGlip2.basic()).toEqual(btoa('glip2_id:glip2_secret'));
  });
  describe('requestDecoration', () => {
    it('should add basic token to params if needAuth is false', () => {
      handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => true);
      handler.accessToken = jest.fn().mockImplementation(() => 'token');
      handler.getBasic = jest.fn().mockImplementation(() => 'basic');
      const decoration = HandleByGlip2.requestDecoration(handler);
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
      const decoration = HandleByGlip2.requestDecoration(handler);
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
      const decoration = HandleByGlip2.requestDecoration(handler);
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
      const decoration = HandleByGlip2.requestDecoration(handler);
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
      const decoration = HandleByGlip2.requestDecoration(null);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => true);
      expect(decoration).toThrow();
    });

    it('should not add any token to headers if Authorization existed', () => {
      handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => true);
      handler.accessToken = jest.fn().mockImplementation(() => 'token');
      handler.getBasic = jest.fn().mockImplementation(() => 'basic');
      const decoration = HandleByGlip2.requestDecoration(handler);
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
