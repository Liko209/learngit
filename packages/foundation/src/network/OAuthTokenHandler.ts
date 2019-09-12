/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:41:41
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { DEFAULT_BEFORE_EXPIRED } from './Constants';
import Token from './Token';
import {
  ITokenHandler,
  IHandleType,
  ITokenRefreshListener,
  IToken,
} from './network';
import { networkLogger } from '../log';
import { ERROR_CODES_NETWORK, JNetworkError } from '../error';

const LOG_TAG = 'OAuthTokenHandler';

class OAuthTokenHandler implements ITokenHandler {
  type: IHandleType;
  token?: Token;
  basic?: string;
  listener?: ITokenRefreshListener;
  isOAuthTokenRefreshing: boolean;

  constructor(
    type: IHandleType,
    token?: Token,
    basic?: string,
    listener?: ITokenRefreshListener,
    isOAuthTokenRefreshing: boolean = false,
  ) {
    this.type = type;
    this.token = token;
    this.basic = basic;
    this.listener = listener;
    this.isOAuthTokenRefreshing = isOAuthTokenRefreshing;
  }

  clearOAuthToken() {
    this.token = undefined;
  }

  getBasic() {
    return this.basic;
  }

  accessToken() {
    /* eslint-disable camelcase */
    if (this.token) {
      const { access_token } = this.token;
      if (access_token) {
        return access_token;
      }
    }
    /* eslint-enable camelcase */
    return '';
  }

  isOAuthTokenAvailable() {
    const token = this.token;
    return !_.isEmpty(token);
  }

  isOAuthAccessTokenExpired() {
    return this.willAccessTokenExpired() && this.isAccessTokenExpired();
  }

  isAccessTokenExpired() {
    return this.isTokenExpired(true);
  }

  isRefreshTokenExpired() {
    return this.isTokenExpired(false);
  }

  isTokenExpired(isAccessToken: boolean) {
    if (!this.token || !this.token.timestamp) {
      return true;
    }

    const timestamp = this.token.timestamp;
    const accessTokenExpireIn = this.token.expires_in;
    const refreshTokenExpireIn = this.token.refresh_token_expires_in;
    const hasExpiredIn = isAccessToken
      ? !!accessTokenExpireIn
      : !!refreshTokenExpireIn;
    if (!hasExpiredIn) {
      return false;
    }

    const accessTokenExpireInMillisecond = accessTokenExpireIn * 1000;
    const duration = isAccessToken
      ? accessTokenExpireInMillisecond - DEFAULT_BEFORE_EXPIRED
      : refreshTokenExpireIn * 1000;

    const now = Date.now();
    if (now < timestamp) {
      return true;
    }
    if (now > timestamp + duration) {
      return true;
    }
    return false;
  }

  /**
   * @override
   */
  isAccessTokenRefreshable() {
    return !!this.token && this.type.tokenRefreshable;
  }

  /**
   * @override
   */
  doRefreshToken(token: IToken) {
    return this.type.doRefreshToken(token);
  }

  /**
   * @override
   */
  willAccessTokenExpired() {
    return this.type.tokenExpirable;
  }

  async getOAuthToken() {
    if (this.isAccessTokenExpired()) {
      return this.refreshOAuthToken();
    }
    return this.token;
  }

  getSyncOAuthToken() {
    return this.token;
  }

  async refreshOAuthToken(): Promise<IToken | undefined> {
    if (this.isOAuthTokenRefreshing || !this.token) {
      return;
    }

    this.isOAuthTokenRefreshing = true;
    let refreshedToken: IToken | undefined;
    if (this.isAccessTokenRefreshable()) {
      if (this.isRefreshTokenExpired()) {
        networkLogger.tags(LOG_TAG).info('The refresh token expired.');
        this._notifyRefreshTokenFailure(true);
      } else {
        refreshedToken = await this.doRefreshToken(this.token)
          .then((token: Token) => {
            if (token) {
              networkLogger
                .tags(LOG_TAG)
                .info('Refreshing Token successfully! Token:', token);
              this.token = token;
              this._notifyRefreshTokenSuccess(token);
            } else {
              networkLogger
                .tags(LOG_TAG)
                .info('Can not get token from server.');
              this._notifyRefreshTokenFailure();
            }
            return token;
          })
          .catch((reason?: JNetworkError) => {
            const forceLogout =
              reason &&
              (reason.code === ERROR_CODES_NETWORK.BAD_REQUEST ||
                reason.code === ERROR_CODES_NETWORK.UNAUTHORIZED);

            networkLogger
              .tags(LOG_TAG)
              .info('Refreshing token error, forceLogout:', forceLogout);
            this._notifyRefreshTokenFailure(forceLogout);
            return undefined;
          });
      }
    } else {
      networkLogger.tags(LOG_TAG).info('Token is not refreshable.');
      this._notifyRefreshTokenFailure(true);
    }
    return refreshedToken;
  }

  private _resetOAuthTokenRefreshingFlag() {
    this.isOAuthTokenRefreshing = false;
  }

  private _notifyRefreshTokenFailure(forceLogout?: boolean) {
    this._resetOAuthTokenRefreshingFlag();
    if (this.listener) {
      this.listener.onRefreshTokenFailure(this.type, !!forceLogout);
    }
  }

  private _notifyRefreshTokenSuccess(token: Token) {
    this._resetOAuthTokenRefreshingFlag();
    if (this.listener) {
      this.listener.onRefreshTokenSuccess(this.type, token);
    }
  }
}

export default OAuthTokenHandler;
