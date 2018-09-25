import _ from 'lodash';
import {
  IRequest,
  OAuthTokenHandler,
  ITokenHandler,
  AbstractHandleType,
  NETWORK_VIA,
} from 'foundation';

const HandleByGlip = new class extends AbstractHandleType {
  rcTokenProvider?: () => string;
  defaultVia = NETWORK_VIA.ALL;
  requestDecoration(tokenHandler: ITokenHandler) {
    const handler = tokenHandler as OAuthTokenHandler;
    return (request: IRequest) => {
      if (request.needAuth()) {
        if (_.isEmpty(handler)) {
          throw new Error('token handler can not be null.');
        }
        if (handler && handler.isOAuthTokenAvailable()) {
          request.params = {
            ...request.params,
            tk: handler.accessToken(),
          };
          request.headers = {
            ...request.headers,
            Authorization: `Bearer ${handler.accessToken()}`,
          };

        }
      }
      if (this.rcTokenProvider && request.via === NETWORK_VIA.SOCKET) {
        request.headers = {
          ...request.headers,
          'X-RC-Access-Token-Data': this.rcTokenProvider(),
        };
      }
      return request;
    };
  }
}();

export default HandleByGlip;
