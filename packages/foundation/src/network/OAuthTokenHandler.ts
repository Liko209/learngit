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
    const isInvalid = isAccessToken
      ? !accessTokenExpireIn
      : !refreshTokenExpireIn;
    if (isInvalid) {
      return true;
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

  refreshOAuthToken() {
    if (!this.isOAuthTokenRefreshing) {
      this.isOAuthTokenRefreshing = true;
      if (this.isAccessTokenRefreshable()) {
        if (this.isRefreshTokenExpired()) {
          this._notifyRefreshTokenFailure();
          return;
        }
        if (this.token) {
          this.doRefreshToken(this.token)
            .then((token: Token) => {
              if (token) {
                this.token = token;
                this._notifyRefreshTokenSuccess(token);
              } else {
                this._notifyRefreshTokenFailure();
              }
            })
            .catch((errorCode: string) => {
              this._notifyRefreshTokenFailure(errorCode);
            });
        }
      } else {
        this._notifyRefreshTokenFailure();
      }
    }
  }

  private _resetOAuthTokenRefreshingFlag() {
    this.isOAuthTokenRefreshing = false;
  }

  private _notifyRefreshTokenFailure(errorCode?: string) {
    this._resetOAuthTokenRefreshingFlag();
    let forceLogout = true;
    const code = Number(errorCode);
    if (code && code >= 500) {
      forceLogout = false;
    }
    if (this.listener) {
      this.listener.onRefreshTokenFailure(this.type, forceLogout);
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
