import _ from 'lodash';

import {
  IRequest,
  OAuthTokenHandler,
  ITokenHandler,
  AbstractHandleType,
  NETWORK_VIA,
  NETWORK_HANDLE_TYPE,
} from 'foundation/network';

const HandleByUpload = new class extends AbstractHandleType {
  name = NETWORK_HANDLE_TYPE.UPLOAD;
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
          request.path = `${request.path}?tk=${handler.accessToken()}`;
        }
      }

      return true;
    };
  }
}();

export default HandleByUpload;
