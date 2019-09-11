import _ from 'lodash';
import {
  IRequest,
  OAuthTokenHandler,
  ITokenHandler,
  AbstractHandleType,
  NETWORK_VIA,
  NETWORK_HANDLE_TYPE,
  Token,
} from 'foundation/network';
import { IPlatformHandleDelegate } from './IPlatformHandleDelegate';

const HandleByGlip = new class extends AbstractHandleType {
  name = NETWORK_HANDLE_TYPE.GLIP;
  rcTokenProvider?: () => Token | undefined;
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
        const token = this.rcTokenProvider();
        request.headers = {
          ...request.headers,
          'X-RC-Access-Token-Data': token && this.btoa(JSON.stringify(token)),
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
