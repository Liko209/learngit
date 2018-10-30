/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:41:38
 * Copyright © RingCentral. All rights reserved.
 */
import OAuthTokenHandler from './OAuthTokenHandler';
import Token from './Token';
import { IHandleType } from './network';
class OAuthTokenManager {
  private static _defaultInstance: OAuthTokenManager;

  public static get defaultInstance() {
    this._defaultInstance =
      this._defaultInstance || (this._defaultInstance = new this());
    return this._defaultInstance;
  }

  public tokenHandlers: Map<IHandleType, OAuthTokenHandler> = new Map();

  addOAuthTokenHandler(handler: OAuthTokenHandler) {
    this.tokenHandlers.set(handler.type, handler);
  }

  getOAuthTokenHandler(type: IHandleType) {
    return this.tokenHandlers.get(type);
  }

  setOAuthToken(token: Token, type: IHandleType) {
    const tokenHandler = this.getOAuthTokenHandler(type);
    if (tokenHandler) {
      tokenHandler.token = token;
    }
  }

  clearOAuthToken() {
    this.tokenHandlers.forEach((handler: OAuthTokenHandler) => {
      handler.clearOAuthToken();
    });
  }

  refreshOAuthToken(type: IHandleType) {
    const tokenHandler = this.getOAuthTokenHandler(type);
    if (tokenHandler) {
      tokenHandler.refreshOAuthToken();
    }
  }
}

export default OAuthTokenManager;
