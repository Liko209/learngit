import _ from 'lodash';

import { IRequest, OAuthTokenHandler, ITokenHandler, AbstractHandleType } from 'foundation';

const HandleByUpload = new class extends AbstractHandleType {
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
        }
      }
      return request;
    };
  }
}();

export default HandleByUpload;
