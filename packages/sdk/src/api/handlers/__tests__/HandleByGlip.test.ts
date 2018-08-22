import { NETWORK_VIA, OAuthTokenHandler, NETWORK_METHOD, NetworkRequestBuilder } from 'foundation';
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

  describe('requestDecoration', () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should not add tk to params if needAuth is false', () => {
      handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => true);
      handler.accessToken = jest.fn().mockImplementation(() => 'token');
      const decoration = HandleByGlip.requestDecoration(handler);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => false);
      const decoratedRequest = decoration(request);
      expect(decoratedRequest.params.tk).toBeUndefined();
      expect(decoratedRequest).toEqual(request);
    });

    it('should not add tk to params if needAuth is true ', () => {
      handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => true);
      handler.accessToken = jest.fn().mockImplementation(() => 'token');
      const decoration = HandleByGlip.requestDecoration(handler);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => true);
      const decoratedRequest = decoration(request);
      expect(decoratedRequest.params.tk).toBeUndefined();
    });

    it('should not add tk to params if isOAuthTokenAvailable is false ', () => {
      handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => false);
      handler.accessToken = jest.fn().mockImplementation(() => 'token');
      const decoration = HandleByGlip.requestDecoration(handler);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => true);
      const decoratedRequest = decoration(request);
      expect(request.params.tk).toBeUndefined();
      expect(decoratedRequest).toEqual(request);
    });

    it('should not add tk to params if isOAuthTokenAvailable is false ', () => {
      const decoration = HandleByGlip.requestDecoration(null);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => true);
      expect(decoration).toThrowError();
    });

    it('should not add x_rc_access_token_data to headers', () => {
      handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => false);
      handler.accessToken = jest.fn().mockImplementation(() => 'token');
      HandleByGlip.rcTokenProvider = jest.fn().mockImplementationOnce(() => 'access_token');
      const decoration = HandleByGlip.requestDecoration(handler);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => true);
      const decoratedRequest = decoration(request);
      expect(request.headers['X-RC-Access-Token-Data']).toEqual('access_token');
      expect(decoratedRequest).toEqual(request);
    });
  });
});
