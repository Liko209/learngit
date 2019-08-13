import OAuthTokenManager from '../OAuthTokenManager';
import {
  getFakeOAuthTokenHandler,
  getFakeToken,
  fakeHandleType,
} from './utils';

const manager = new OAuthTokenManager();

describe('OAuthTokenManager', () => {
  describe('addOAuthTokenHandler', () => {
    it('should call set', () => {
      const spy = jest.spyOn(manager.tokenHandlers, 'set');
      manager.addOAuthTokenHandler(getFakeOAuthTokenHandler());
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('refreshOAuthToken', () => {
    it('should call refreshOAuthToken', () => {
      const handler = getFakeOAuthTokenHandler();
      manager.getOAuthTokenHandler = jest.fn().mockReturnValueOnce(handler);
      const spy = jest.spyOn(handler, 'refreshOAuthToken');
      handler.refreshOAuthToken();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('setOAuthToken', () => {
    it('setOAuthToken', () => {
      const handler = getFakeOAuthTokenHandler();
      manager.getOAuthTokenHandler = jest.fn().mockReturnValueOnce(handler);
      const token = getFakeToken();
      manager.setOAuthToken(token, fakeHandleType);
      expect(handler.token).toEqual(token);
    });
  });

  describe('getOAuthToken', () => {
    it('should get correct token', async () => {
      const handler = getFakeOAuthTokenHandler();
      handler.getOAuthToken = jest.fn().mockResolvedValue('token');
      manager.getOAuthTokenHandler = jest.fn().mockReturnValueOnce(handler);
      expect(await manager.getOAuthToken(fakeHandleType)).toEqual('token');
      expect(handler.getOAuthToken).toHaveBeenCalled();
    });
  });
});
