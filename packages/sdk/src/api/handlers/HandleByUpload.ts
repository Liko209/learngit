import _ from 'lodash';

import {
  IRequest,
  OAuthTokenHandler,
  ITokenHandler,
  AbstractHandleType,
  NETWORK_VIA,
} from 'foundation';

const HandleByUpload = new class extends AbstractHandleType {
  defaultVia = NETWORK_VIA.HTTP;
  survivalModeSupportable = true;
  requestDecoration(tokenHandler: ITokenHandler) {
    const handler = tokenHandler as OAuthTokenHandler;
    return (request: IRequest) => {
      if (request.needAuth()) {
        if (_.isEmpty(tokenHandler)) {
          throw new Error('token handler can not be null.');
        }
        if (handler.isOAuthTokenAvailable()) {
          request.params = {
            ...request.params,
          };
          request.headers = {
            ...request.headers,
            Authorization: `Bearer ${handler.accessToken()}`,
          };
        }
      }
      return request;
    };
  }
}();

export default HandleByUpload;
