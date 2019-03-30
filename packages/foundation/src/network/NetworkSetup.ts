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
  static setup(type: IHandleType, networkManager: NetworkManager) {
    const tokenHandler = new OAuthTokenHandler(type);
    const decoration = type.requestDecoration(tokenHandler);
    const handler = networkManager.buildNetworkRequestBaseHandler(
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
  }
}

class TokenRefreshListener implements ITokenRefreshListener {
  constructor(
    private tokenHandler: OAuthTokenHandler,
    private requestHandler: NetworkRequestHandler,
    private onFailure: (forceLogout: boolean) => void,
  ) {}
  onRefreshTokenSuccess(handlerType: IHandleType, token: IToken) {
    if (_.isEmpty(token)) {
      throw new Error('token can not be null.');
    }
    this.tokenHandler.token = token;
    this.requestHandler.notifyTokenRefreshed();
  }

  onRefreshTokenFailure(handlerType: IHandleType, forceLogout: boolean) {
    this.requestHandler.cancelAll();
    this.onFailure(forceLogout);
  }
}
export default NetworkSetup;
