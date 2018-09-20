/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-03 13:51:11
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import ClientManager from './client/Manager';
import NetworkRequestHandler from './NetworkRequestHandler';
import OAuthTokenManager from './OAuthTokenManager';
import NetworkRequestConsumer from './NetworkRequestConsumer';
import NetworkRequestSurvivalMode from './NetworkRequestSurvivalMode';
import NetworkRequestDecorator from './NetworkRequestDecorator';
import {
  IHandleType,
  IRequest,
  IToken,
  NETWORK_VIA,
  CONSUMER_MAX_QUEUE_COUNT,
  IRequestDecoration,
} from './network';

class NetworkManager {
  private static _instance: NetworkManager;

  clientManager: ClientManager;
  handlers: Map<IHandleType, NetworkRequestHandler>;
  tokenManager?: OAuthTokenManager;
  decorator?: NetworkRequestDecorator;

  constructor(oauthTokenManager = OAuthTokenManager.Instance) {
    this.clientManager = new ClientManager();
    this.handlers = new Map<IHandleType, NetworkRequestHandler>();
    this.tokenManager = oauthTokenManager;
  }

  public static get Instance() {
    this._instance = this._instance || (this._instance = new this());
    return this._instance;
  }

  addApiRequest(request: IRequest, isTail = true) {
    const handler = this.networkRequestHandler(request.handlerType);
    if (handler) {
      handler.addApiRequest(request, isTail);
    }
  }

  pause() {
    this.handlers.forEach(handler => {
      handler.pause();
    });
  }

  resume() {
    this.handlers.forEach(handler => {
      handler.resume();
    });
  }

  cancelAll() {
    this.handlers.forEach(handler => {
      handler.cancelAll();
    });
  }

  cancelRequest(request: IRequest) {
    const handler = this.networkRequestHandler(request.handlerType);
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
    this.handlers.set(handler.type, handler);
  }

  networkRequestHandler(type: IHandleType) {
    return this.handlers.get(type);
  }
  addRequestConsumer(
    handler: NetworkRequestHandler,
    via: NETWORK_VIA,
    consumer: NetworkRequestConsumer,
  ) {
    handler.addRequestConsumer(via, consumer);
  }
  initNetworkRequestBaseHandler(
    handlerType: IHandleType,
    hasSurvivalMode = false,
    decorator: IRequestDecoration,
  ) {
    if (_.isEmpty(this.tokenManager) || !this.tokenManager) {
      throw new Error('token manager can not be null.');
    }
    const finalDecorator = new NetworkRequestDecorator(decorator);
    const handler = new NetworkRequestHandler(this.tokenManager, handlerType);

    const httpVia = NETWORK_VIA.HTTP;
    const httpConsumer = new NetworkRequestConsumer(
      handler,
      this.clientManager.getApiClient(httpVia),
      CONSUMER_MAX_QUEUE_COUNT.HTTP,
      httpVia,
      handler,
      finalDecorator,
    );
    this.addRequestConsumer(handler, httpVia, httpConsumer);
    const socketVia = NETWORK_VIA.SOCKET;
    const socketConsumer = new NetworkRequestConsumer(
      handler,
      this.clientManager.getApiClient(socketVia),
      CONSUMER_MAX_QUEUE_COUNT.SOCKET,
      socketVia,
      handler,
      finalDecorator,
    );
    this.addRequestConsumer(handler, socketVia, socketConsumer);

    if (hasSurvivalMode) {
      const survivalMode = new NetworkRequestSurvivalMode();
      handler.setNetworkRequestSurvivalMode(survivalMode);
    }

    this.addNetworkRequestHandler(handler);
    return handler;
  }
}

export default NetworkManager;
