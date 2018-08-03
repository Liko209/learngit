import _ from 'lodash';
import { IRequest, OAuthTokenHandler, ITokenHandler, AbstractHandleType } from 'foundation';

const HandleByGlip = new class extends AbstractHandleType {
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
        }
      }
      return request;
    };
  }
}();

export default HandleByGlip;
