import _ from 'lodash';
import { stringify } from 'qs';

import { IRequest, OAuthTokenHandler, ITokenHandler, AbstractHandleType, IToken } from 'foundation';
import Api from '../api';
import AccountService from '../../service/account';

const HandleByRingCentral = new class extends AbstractHandleType {
  survivalModeSupportable = true;
  tokenExpirable = true;
  tokenRefreshable = true;
  basic() {
    return btoa(`${Api.httpConfig.rc.clientId}:${Api.httpConfig.rc.clientSecret}`);
  }
  requestDecoration(tokenHandler: ITokenHandler) {
    const handler = tokenHandler as OAuthTokenHandler;
    return (request: IRequest) => {
      if (_.isEmpty(handler)) {
        throw new Error('token handler can not be null.');
      }

      const headers = request.headers;

      if (!headers.Authorization) {
        if (request.needAuth() && handler.isOAuthTokenAvailable()) {
          headers.Authorization = `Bearer ${handler.accessToken()}`;
        } else {
          headers.Authorization = `Basic ${handler.getBasic()}`;
        }
      }

      const authorization = headers.Authorization;
      if (authorization.startsWith('Basic')) {
        request.data = stringify(request.data);
      }
      return request;
    };
  }

  doRefreshToken(token: IToken) {
    return new Promise<IToken>(async (resolve, reject) => {
      try {
        const accountService: AccountService = AccountService.getInstance();
        const refreshedToken = await accountService.refreshRCToken();
        if (refreshedToken) {
          token.access_token = refreshedToken.access_token;
          token.accessTokenExpireIn = refreshedToken.accessTokenExpireIn;
          token.refreshToken = refreshedToken.refreshToken;
          token.refreshTokenExpireIn = refreshedToken.refreshTokenExpireIn;
          token.timestamp = refreshedToken.timestamp;
          resolve(token);
        } else {
          reject(token);
        }
      } catch (err) {
        reject(err);
      }
    });
  }
}();

export default HandleByRingCentral;
