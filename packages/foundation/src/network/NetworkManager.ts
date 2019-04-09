/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-03 13:51:11
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import ClientManager from './client/Manager';
import NetworkRequestHandler from './NetworkRequestHandler';
import OAuthTokenManager from './OAuthTokenManager';
import { AbstractConsumer, HttpConsumer, SocketConsumer } from './consumer';
import NetworkRequestSurvivalMode from './NetworkRequestSurvivalMode';
import NetworkRequestDecorator from './NetworkRequestDecorator';
import {
  IHandleType,
  IRequest,
  IToken,
  NETWORK_VIA,
  IRequestDecoration,
  NETWORK_HANDLE_TYPE,
} from './network';

class NetworkManager {
  clientManager: ClientManager;
  handlers: Map<NETWORK_HANDLE_TYPE, NetworkRequestHandler>;
  tokenManager?: OAuthTokenManager;
  decorator?: NetworkRequestDecorator;

  constructor(oauthTokenManager: OAuthTokenManager) {
    this.clientManager = new ClientManager();
    this.handlers = new Map<NETWORK_HANDLE_TYPE, NetworkRequestHandler>();
    this.tokenManager = oauthTokenManager;
  }

  addApiRequest(request: IRequest, isTail = true) {
    const handler = this.networkRequestHandler(request.handlerType.name);
    if (handler) {
      handler.addApiRequest(request, isTail);
    }
  }

  pause() {
    this.handlers.forEach(handler => handler.pause());
  }

  resume() {
    this.handlers.forEach(handler => handler.resume());
  }

  cancelAll() {
    this.handlers.forEach(handler => handler.cancelAll());
  }

  cancelRequest(request: IRequest) {
    const handler = this.networkRequestHandler(request.handlerType.name);
    if (handler) {
      handler.cancelRequest(request);
    }
  }

  getTokenManager() {
    return this.tokenManager;
  }

  setOAuthToken(token: IToken, handlerType: IHandleType) {
    if (_.isEmpty(this.tokenManager)) {
      throw new Error('token manager can not be null.');
    }
    if (this.tokenManager) {
      this.tokenManager.setOAuthToken(token, handlerType);
    }
  }

  clearToken() {
    if (this.tokenManager) {
      this.tokenManager.clearOAuthToken();
    }
  }

  addNetworkRequestHandler(handler: NetworkRequestHandler) {
    this.handlers.set(handler.type.name, handler);
  }

  networkRequestHandler(type: NETWORK_HANDLE_TYPE) {
    return this.handlers.get(type);
  }
  addRequestConsumer(
    handler: NetworkRequestHandler,
    via: NETWORK_VIA,
    consumer: AbstractConsumer,
  ) {
    handler.addRequestConsumer(via, consumer);
  }
  buildNetworkRequestBaseHandler(
    handlerType: IHandleType,
    hasSurvivalMode = false,
    decorator: IRequestDecoration,
  ) {
    if (_.isEmpty(this.tokenManager) || !this.tokenManager) {
      throw new Error('token manager can not be null.');
    }
    const finalDecorator = new NetworkRequestDecorator(decorator);
    const handler = new NetworkRequestHandler(this.tokenManager, handlerType);

    const socketVia = NETWORK_VIA.SOCKET;
    const socketConsumer = new SocketConsumer(
      handler,
      handler,
      this.clientManager.getApiClient(socketVia),
      finalDecorator,
    );
    this.addRequestConsumer(handler, socketVia, socketConsumer);

    const httpVia = NETWORK_VIA.HTTP;
    const httpConsumer = new HttpConsumer(
      handler,
      handler,
      this.clientManager.getApiClient(httpVia),
      finalDecorator,
    );
    this.addRequestConsumer(handler, httpVia, httpConsumer);

    if (hasSurvivalMode) {
      const survivalMode = new NetworkRequestSurvivalMode(
        handlerType.checkServerStatus,
      );
      handler.setNetworkRequestSurvivalMode(survivalMode);
    }

    this.addNetworkRequestHandler(handler);
    return handler;
  }
}

export default NetworkManager;
