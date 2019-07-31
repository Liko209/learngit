import { OAuthTokenHandler } from '..';
import { fakeHandleType, getFakeTokenHandler, getFakeToken } from './utils';
import { JNetworkError, ERROR_CODES_NETWORK } from '../../error';

let handler = new OAuthTokenHandler(fakeHandleType, getFakeTokenHandler());
const fakeListener = {
  onRefreshTokenFailure: jest.fn(),
} as any;
handler.listener = fakeListener;

describe('OAuthTokenHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
    handler = new OAuthTokenHandler(fakeHandleType, getFakeTokenHandler());
    handler.listener = fakeListener;
  });

  describe('refreshOAuthToken', () => {
    it('should not notifyRefreshTokenFailure if isOAuthTokenRefreshing', () => {
      handler.isOAuthTokenRefreshing = true;
      const spy = jest.spyOn(handler, '_notifyRefreshTokenFailure');
      handler.refreshOAuthToken();
      expect(spy).not.toHaveBeenCalled();
    });
    it('should notifyRefreshTokenFailure if is not AccessTokenRefreshable', () => {
      handler.isOAuthTokenRefreshing = false;
      handler.isAccessTokenRefreshable = jest.fn().mockReturnValueOnce(false);
      const spy = jest.spyOn(handler, '_notifyRefreshTokenFailure');
      handler.refreshOAuthToken();
      expect(spy).toHaveBeenCalledWith(true);
    });

    it('should notifyRefreshTokenFailure if isRefreshTokenExpired', () => {
      handler.isOAuthTokenRefreshing = false;
      handler.isAccessTokenRefreshable = jest.fn().mockReturnValueOnce(true);
      handler.isRefreshTokenExpired = jest.fn().mockReturnValueOnce(true);
      const spy = jest.spyOn(handler, '_notifyRefreshTokenFailure');
      handler.refreshOAuthToken();
      expect(spy).toHaveBeenCalledWith(true);
    });

    it('should call notifyRefreshTokenFailure with true when refresh token failed', done => {
      handler.token = 'token';
      handler.isOAuthTokenRefreshing = false;
      handler.isAccessTokenRefreshable = jest.fn().mockReturnValueOnce(true);
      handler.isRefreshTokenExpired = jest.fn().mockReturnValueOnce(false);
      handler.doRefreshToken = jest
        .fn()
        .mockRejectedValue(
          new JNetworkError(ERROR_CODES_NETWORK.UNAUTHORIZED, ''),
        );
      const spy = jest.spyOn(handler, '_notifyRefreshTokenFailure');
      handler.refreshOAuthToken();
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith(true);
        done();
      });
    });

    it('should doRefreshToken', () => {
      handler.token = getFakeToken();
      handler.isOAuthTokenRefreshing = false;
      handler.isAccessTokenRefreshable = jest.fn().mockReturnValueOnce(true);
      handler.isRefreshTokenExpired = jest.fn().mockReturnValueOnce(false);
      const spy = jest.spyOn(handler, 'doRefreshToken');
      handler.refreshOAuthToken();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('isTokenExpired', () => {
    it('should return true', () => {
      handler.token = getFakeToken();
      expect(handler.isTokenExpired(false)).toBeFalsy();
      expect(handler.isTokenExpired(true)).toBeTruthy();
      handler.token = null;
      expect(handler.isTokenExpired(true)).toBeTruthy();
      handler.token = getFakeToken();
      handler.token.timestamp = null;
      expect(handler.isTokenExpired(true)).toBeTruthy();

      handler.token = getFakeToken();
      handler.token.expires_in = null;
      expect(handler.isTokenExpired(true)).toBeFalsy();

      handler.token = getFakeToken();
      handler.token.refresh_token_expires_in = null;
      expect(handler.isTokenExpired(false)).toBeFalsy();

      handler.token = getFakeToken();
      handler.token.timestamp = Date.now() + 6000;
      expect(handler.isTokenExpired(true)).toBeTruthy();
    });
  });

  describe('_notifyRefreshTokenFailure()', () => {
    it('should not force logout when forceLogout is false', () => {
      handler['_notifyRefreshTokenFailure'](false);
      expect(handler.listener!.onRefreshTokenFailure).toHaveBeenCalledWith(
        handler.type,
        false,
      );
    });

    it('should not force logout when forceLogout is undefined', () => {
      handler['_notifyRefreshTokenFailure']();
      expect(handler.listener!.onRefreshTokenFailure).toHaveBeenCalledWith(
        handler.type,
        false,
      );
    });
  });
});
