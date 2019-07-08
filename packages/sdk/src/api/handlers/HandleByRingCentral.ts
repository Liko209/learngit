import _ from 'lodash';
import { stringify } from 'qs';
import {
  IRequest,
  OAuthTokenHandler,
  ITokenHandler,
  AbstractHandleType,
  IToken,
  NETWORK_VIA,
  NETWORK_HANDLE_TYPE,
  ERROR_CODES_NETWORK,
} from 'foundation';
import { IPlatformHandleDelegate } from './IPlatformHandleDelegate';
/* eslint-disable */
const HandleByRingCentral = new (class extends AbstractHandleType {
  name = NETWORK_HANDLE_TYPE.RINGCENTRAL;
  defaultVia = NETWORK_VIA.HTTP;
  survivalModeSupportable = true;
  tokenExpirable = true;
  tokenRefreshable = true;
  platformHandleDelegate: IPlatformHandleDelegate;

  requestDecoration(tokenHandler: ITokenHandler) {
    const handler = tokenHandler as OAuthTokenHandler;
    return (request: IRequest) => {
      if (!request.authFree && handler && handler.isOAuthAccessTokenExpired()) {
        return false;
      }

      if (_.isEmpty(handler)) {
        throw new Error('token handler can not be null.');
      }

      const headers = request.headers;

      if (!headers.Authorization) {
        if (request.needAuth() && handler.isOAuthTokenAvailable()) {
          headers.Authorization = `Bearer ${handler.accessToken()}`;
        }
      }

      const authorization = headers.Authorization;
      if (!authorization) {
        request.data = stringify(request.data);
      }
      return true;
    };
  }

  doRefreshToken() {
    return new Promise<IToken>(async (resolve, reject) => {
      try {
        if (this.platformHandleDelegate) {
          const refreshedToken = await this.platformHandleDelegate.refreshRCToken();
          refreshedToken ? resolve(refreshedToken) : reject();
        } else {
          reject();
        }
      } catch (reason) {
        reject(
          reason.code === ERROR_CODES_NETWORK.BAD_REQUEST ||
            reason.code === ERROR_CODES_NETWORK.UNAUTHORIZED,
        );
      }
    });
  }

  checkServerStatus = (
    callback: (success: boolean, retryAfter: number) => void,
  ) => {
    if (!this.platformHandleDelegate) {
      callback(true, 0);
      return;
    }
    this.platformHandleDelegate.checkServerStatus(callback);
  };

  onRefreshTokenFailure = (forceLogout: boolean) => {
    if (!this.platformHandleDelegate) {
      return;
    }
    this.platformHandleDelegate.onRefreshTokenFailure(forceLogout);
  };
})();

export default HandleByRingCentral;
