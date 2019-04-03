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
} from 'foundation';
import Api from '../api';
import { IPlatformHandleDelegate } from '../ringcentral/IPlatformHandleDelegate';

const HandleByRingCentral = new class extends AbstractHandleType {
  name = NETWORK_HANDLE_TYPE.RINGCENTRAL;
  defaultVia = NETWORK_VIA.HTTP;
  survivalModeSupportable = true;
  tokenExpirable = true;
  tokenRefreshable = true;
  platformHandleDelegate: IPlatformHandleDelegate;

  basic() {
    const str = `${Api.httpConfig.rc.clientId}:${
      Api.httpConfig.rc.clientSecret
    }`;

    return this.btoa(str);
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
        if (this.platformHandleDelegate) {
          const refreshedToken = await this.platformHandleDelegate.refreshRCToken();
          refreshedToken ? resolve(refreshedToken) : reject();
        } else {
          reject();
        }
      } catch (errorCode) {
        reject(errorCode);
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
  }

  onRefreshTokenFailure = (forceLogout: boolean) => {
    if (!this.platformHandleDelegate) {
      return;
    }
    this.platformHandleDelegate.onRefreshTokenFailure(forceLogout);
  }
}();

export default HandleByRingCentral;
