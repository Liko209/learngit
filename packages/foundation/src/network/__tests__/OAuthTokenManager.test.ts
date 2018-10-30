import OAuthTokenManager from '../OAuthTokenManager';
import {
  getFakeOAuthTokenHandler,
  getFakeToken,
  fakeHandleType,
} from './utils';

const manager = OAuthTokenManager.defaultInstance;

describe('OAuthTokenManager', () => {
  describe('addOAuthTokenHandler', () => {
    it('should call set', () => {
      const spy = jest.spyOn(manager.tokenHandlers, 'set');
      manager.addOAuthTokenHandler(getFakeOAuthTokenHandler());
      expect(spy).toBeCalled();
    });
  });

  describe('refreshOAuthToken', () => {
    it('should call refreshOAuthToken', () => {
      const handler = getFakeOAuthTokenHandler();
      manager.getOAuthTokenHandler = jest.fn().mockReturnValueOnce(handler);
      const spy = jest.spyOn(handler, 'refreshOAuthToken');
      handler.refreshOAuthToken();
      expect(spy).toBeCalled();
    });
  });

  describe('setOAuthToken', () => {
    const handler = getFakeOAuthTokenHandler();
    manager.getOAuthTokenHandler = jest.fn().mockReturnValueOnce(handler);
    const token = getFakeToken();
    manager.setOAuthToken(token, fakeHandleType);
    expect(handler.token).toEqual(token);
  });
});
