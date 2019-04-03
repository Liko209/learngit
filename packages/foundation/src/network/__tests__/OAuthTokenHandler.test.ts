import { OAuthTokenHandler } from '..';
import { fakeHandleType, getFakeTokenHandler, getFakeToken } from './utils';

const handler = new OAuthTokenHandler(fakeHandleType, getFakeTokenHandler());
const fakeListener = {
  onRefreshTokenFailure: jest.fn(),
} as any;
handler.listener = fakeListener;

describe('OAuthTokenHandler', () => {
  describe('refreshOAuthToken', () => {
    it('should not notifyRefreshTokenFailure if isOAuthTokenRefreshing', () => {
      handler.isOAuthTokenRefreshing = true;
      const spy = jest.spyOn(handler, '_notifyRefreshTokenFailure');
      handler.refreshOAuthToken();
      expect(spy).not.toBeCalled();
    });
    it('should notifyRefreshTokenFailure if is not AccessTokenRefreshable', () => {
      handler.isOAuthTokenRefreshing = false;
      handler.isAccessTokenRefreshable = jest.fn().mockReturnValueOnce(false);
      const spy = jest.spyOn(handler, '_notifyRefreshTokenFailure');
      handler.refreshOAuthToken();
      expect(spy).toBeCalled();
    });

    it('should notifyRefreshTokenFailure if isRefreshTokenExpired', () => {
      handler.isOAuthTokenRefreshing = false;
      handler.isAccessTokenRefreshable = jest.fn().mockReturnValueOnce(true);
      handler.isRefreshTokenExpired = jest.fn().mockReturnValueOnce(true);
      const spy = jest.spyOn(handler, '_notifyRefreshTokenFailure');
      handler.refreshOAuthToken();
      expect(spy).toBeCalled();
    });

    it('should doRefreshToken', () => {
      handler.token = getFakeToken();
      handler.isOAuthTokenRefreshing = false;
      handler.isAccessTokenRefreshable = jest.fn().mockReturnValueOnce(true);
      handler.isRefreshTokenExpired = jest.fn().mockReturnValueOnce(false);
      const spy = jest.spyOn(handler, 'doRefreshToken');
      handler.refreshOAuthToken();
      expect(spy).toBeCalled();
    });
  });

  describe('isTokenExpired', () => {
    it('should return true', () => {
      expect(handler.isTokenExpired(false)).toBeFalsy();
      expect(handler.isTokenExpired(true)).toBeTruthy();
      handler.token = null;
      expect(handler.isTokenExpired(true)).toBeTruthy();
      handler.token = getFakeToken();
      handler.token.timestamp = null;
      expect(handler.isTokenExpired(true)).toBeTruthy();

      handler.token = getFakeToken();
      handler.token.expires_in = null;
      expect(handler.isTokenExpired(true)).toBeTruthy();

      handler.token = getFakeToken();
      handler.token.refresh_token_expires_in = null;
      expect(handler.isTokenExpired(false)).toBeTruthy();

      handler.token = getFakeToken();
      handler.token.timestamp = Date.now() + 6000;
      expect(handler.isTokenExpired(true)).toBeTruthy();
    });
  });

  describe('_notifyRefreshTokenFailure()', () => {
    it('should not force logout when error code >= 500', () => {
      handler['_notifyRefreshTokenFailure']('500');
      expect(handler.listener!.onRefreshTokenFailure).toBeCalledWith(
        handler.type,
        false,
      );
    });
  });
});
