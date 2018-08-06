import { OAuthTokenHandler, NETWORK_METHOD, NetworkRequestBuilder } from 'foundation';
import HandleByGlip from '../HandleByGlip';

const handler = new OAuthTokenHandler(HandleByGlip, null);

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

    it('should add tk to params if needAuth is true ', () => {
      handler.isOAuthTokenAvailable = jest.fn().mockImplementation(() => true);
      handler.accessToken = jest.fn().mockImplementation(() => 'token');
      const decoration = HandleByGlip.requestDecoration(handler);
      const request = postRequest();
      request.needAuth = jest.fn().mockImplementation(() => true);
      const decoratedRequest = decoration(request);
      expect(decoratedRequest.params.tk).toBe('token');
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
  });
});
