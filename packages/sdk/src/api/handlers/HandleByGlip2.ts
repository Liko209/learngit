import _ from 'lodash';
import { stringify } from 'qs';

import {
  IRequest,
  OAuthTokenHandler,
  ITokenHandler,
  AbstractHandleType,
  NETWORK_VIA,
  NETWORK_HANDLE_TYPE,
} from 'foundation';

import Api from '../api';

const HandleByGlip2 = new class extends AbstractHandleType {
  name = NETWORK_HANDLE_TYPE.GLIP2;
  defaultVia = NETWORK_VIA.HTTP;
  tokenRefreshable = true;
  basic() {
    return this.btoa(
      `${Api.httpConfig.glip2.clientId}:${Api.httpConfig.glip2.clientSecret}`,
    );
  }
  requestDecoration(tokenHandler: ITokenHandler) {
    const handler = tokenHandler as OAuthTokenHandler;
    return (request: IRequest) => {
      if (_.isEmpty(tokenHandler)) {
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

export default HandleByGlip2;
