/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-22 15:04:01
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IHandleType,
  IRequest,
  ITokenHandler,
  IToken,
  IRequestDecoration,
  ITokenRefreshListener,
} from './network';
import _ from 'lodash';
import OAuthTokenHandler from './OAuthTokenHandler';
import NetworkManager from './NetworkManager';
import OAuthTokenManager from './OAuthTokenManager';
import NetworkRequestHandler from './NetworkRequestHandler';

class NetworkSetup {
  static  SETUP(types: IHandleType[]) {
    types.forEach((type: IHandleType) => {
      const tokenHandler = new OAuthTokenHandler(
        type,
        new class implements ITokenHandler {
          isAccessTokenRefreshable() {
            return type.tokenRefreshable;
          }
          doRefreshToken(token: IToken) {
            return type.doRefreshToken(token);
          }
          willAccessTokenExpired() {
            return type.tokenExpirable;
          }
        }(),
      );
      const decoration = type.requestDecoration(tokenHandler);
      const handler = NetworkManager.Instance.initNetworkRequestBaseHandler(
        type,
        type.survivalModeSupportable,
        new class implements IRequestDecoration {
          decorate(request: IRequest) {
            return decoration(request);
          }
        }(),
      );
      tokenHandler.listener = new TokenRefreshListener(tokenHandler, handler);
      tokenHandler.basic = type.basic();
      OAuthTokenManager.Instance.addOAuthTokenHandler(tokenHandler);
    });
  }
}

class TokenRefreshListener implements ITokenRefreshListener {
  constructor(
    private tokenHandler: OAuthTokenHandler,
    private requestHandler: NetworkRequestHandler,
  ) {
    this.tokenHandler = tokenHandler;
    this.requestHandler = requestHandler;
  }
  onRefreshTokenSuccess(handlerType: IHandleType, token: IToken) {
    if (_.isEmpty(token)) {
      throw new Error('token can not be null.');
    }
    this.tokenHandler.token = token;
    this.requestHandler.notifyTokenRefreshed();
  }

  onRefreshTokenFailure(handlerType: IHandleType) {
    this.requestHandler.cancelAll();
  }
}
export default NetworkSetup;
