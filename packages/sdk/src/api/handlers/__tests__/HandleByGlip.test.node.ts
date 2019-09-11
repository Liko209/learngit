import {
  NETWORK_VIA,
  OAuthTokenHandler,
  NETWORK_METHOD,
  NetworkRequestBuilder,
} from 'foundation/network';
import HandleByGlip from '../HandleByGlip';

const handler = new OAuthTokenHandler(HandleByGlip, null);

const postRequest = () => {
  return new NetworkRequestBuilder()
    .setPath('/')
    .setVia(NETWORK_VIA.SOCKET)
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

describe('HandleByGlip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestDecoration', () => {
    it('should not add tk to headers if needAuth is false', () => {
      handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => true);
      handler.getSyncOAuthToken = jest.fn().mockImplementation(() => 'token');
      const decoration = HandleByGlip.requestDecoration(handler);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => false);
      decoration(request);
      expect(request.params && request.params.tk).toBeUndefined();
      expect(request.headers.Authorization).toBeUndefined();
      expect(request).toEqual(request);
    });

    it('should add tk to headers if needAuth is true ', () => {
      handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => true);
      handler.getSyncOAuthToken = jest.fn().mockImplementation(() => 'token');
      const decoration = HandleByGlip.requestDecoration(handler);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => true);
      decoration(request);
      expect(request.params && request.params.tk).toBeUndefined();
      expect(request.headers.Authorization).not.toBeUndefined();
    });

    it('should not add tk to headers if isOAuthTokenAvailable is false ', () => {
      handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => false);
      handler.getSyncOAuthToken = jest.fn().mockImplementation(() => 'token');
      const decoration = HandleByGlip.requestDecoration(handler);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => true);
      decoration(request);
      expect(request.params && request.params.tk).toBeUndefined();
      expect(request.headers.Authorization).toBeUndefined();
      expect(request).toEqual(request);
    });

    it('should not add tk to params if isOAuthTokenAvailable is false ', () => {
      const decoration = HandleByGlip.requestDecoration(null);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => true);
      expect(decoration).toThrow();
    });

    it('should not add x_rc_access_token_data to headers', () => {
      handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => false);
      handler.getSyncOAuthToken = jest.fn().mockImplementation(() => 'token');
      const token = { access_token: "good" }
      HandleByGlip.rcTokenProvider = jest
        .fn()
        .mockImplementationOnce(() => token);
      const decoration = HandleByGlip.requestDecoration(handler);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => true);
      decoration(request);
      expect(request.headers['X-RC-Access-Token-Data']).toEqual(btoa(JSON.stringify(token)));
      expect(request).toEqual(request);
    });
  });

  describe('onRefreshTokenFailure', () => {
    it('should do nothing when delegate is invalid', () => {
      HandleByGlip.platformHandleDelegate = undefined as any;
      HandleByGlip.onRefreshTokenFailure(true);
    });

    it('should call delegate when delegate is valid', () => {
      HandleByGlip.platformHandleDelegate = {
        onRefreshTokenFailure: jest.fn(),
      } as any;
      HandleByGlip.onRefreshTokenFailure(true);
      expect(
        HandleByGlip.platformHandleDelegate.onRefreshTokenFailure,
      ).toHaveBeenCalledWith(true);
    });
  });
});
