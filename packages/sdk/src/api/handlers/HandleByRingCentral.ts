import _ from 'lodash';
import { stringify } from 'qs';

import { IRequest, OAuthTokenHandler, ITokenHandler, AbstractHandleType } from 'foundation';
import Api from '../api';

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
}();

export default HandleByRingCentral;
