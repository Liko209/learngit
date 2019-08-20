import _ from 'lodash';
import {
  IRequest,
  OAuthTokenHandler,
  ITokenHandler,
  AbstractHandleType,
  NETWORK_VIA,
  NETWORK_HANDLE_TYPE,
} from 'foundation/network';
import { IPlatformHandleDelegate } from './IPlatformHandleDelegate';

const HandleByGlip = new class extends AbstractHandleType {
  name = NETWORK_HANDLE_TYPE.GLIP;
  rcTokenProvider?: () => string;
  defaultVia = NETWORK_VIA.ALL;
  platformHandleDelegate: IPlatformHandleDelegate;

  requestDecoration(tokenHandler: ITokenHandler) {
    const handler = tokenHandler as OAuthTokenHandler;
    return (request: IRequest) => {
      if (request.needAuth()) {
        if (_.isEmpty(handler)) {
          throw new Error('token handler can not be null.');
        }
        if (handler && handler.isOAuthTokenAvailable()) {
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
      return true;
    };
  }

  onRefreshTokenFailure = (forceLogout: boolean) => {
    if (!this.platformHandleDelegate) {
      return;
    }
    this.platformHandleDelegate.onRefreshTokenFailure(forceLogout);
  };
}();

export default HandleByGlip;
