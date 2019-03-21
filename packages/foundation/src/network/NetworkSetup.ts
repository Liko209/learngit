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
import NetworkRequestHandler from './NetworkRequestHandler';

class NetworkSetup {
  static setup(types: IHandleType[], networkManager: NetworkManager) {
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
      const handler = networkManager.initNetworkRequestBaseHandler(
        type,
        type.survivalModeSupportable,
        new class implements IRequestDecoration {
          decorate(request: IRequest) {
            return decoration(request);
          }
        }(),
      );
      tokenHandler.listener = new TokenRefreshListener(
        tokenHandler,
        handler,
        type.onRefreshTokenFailure,
      );
      tokenHandler.basic = type.basic();

      const tokenManager = networkManager.getTokenManager();
      if (tokenManager) {
        tokenManager.addOAuthTokenHandler(tokenHandler);
      }
    });
  }
}

class TokenRefreshListener implements ITokenRefreshListener {
  constructor(
    private tokenHandler: OAuthTokenHandler,
    private requestHandler: NetworkRequestHandler,
    private onFailure: () => void,
  ) {}
  onRefreshTokenSuccess(handlerType: IHandleType, token: IToken) {
    if (_.isEmpty(token)) {
      throw new Error('token can not be null.');
    }
    this.tokenHandler.token = token;
    this.requestHandler.notifyTokenRefreshed();
  }

  onRefreshTokenFailure(handlerType: IHandleType) {
    this.requestHandler.cancelAll();
    this.onFailure();
  }
}
export default NetworkSetup;
