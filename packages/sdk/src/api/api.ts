/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-02 16:47:08
 * Copyright © RingCentral. All rights reserved.
 */
import merge from 'lodash/merge';
import NetworkClient, { INetworkRequests } from './NetworkClient';
import { ApiConfig, HttpConfigType, PartialApiConfig } from '../types';
import { Throw, ErrorTypes, Aware } from '../utils';
import { defaultConfig } from './defaultConfig';
import { Raw } from '../models';

import { IHandleType, NetworkSetup, NetworkManager } from 'foundation';
import {
  HandleByGlip,
  HandleByRingCentral,
  HandleByGlip2,
  HandleByUpload,
  HandleByCustom,
} from './handlers';
const types = [
  HandleByGlip,
  HandleByRingCentral,
  HandleByGlip2,
  HandleByUpload,
  HandleByCustom,
];
class Api {
  static basePath = '';
  static httpSet: Map<string, NetworkClient> = new Map();
  static _httpConfig: ApiConfig;

  static _networkManager: NetworkManager;

  static init(config: PartialApiConfig, networkManager: NetworkManager): void {
    this._httpConfig = merge({}, defaultConfig, config);
    Api.setupHandlers(networkManager);
  }

  static setupHandlers(networkManager: NetworkManager) {
    this._networkManager = networkManager;

    NetworkSetup.setup(types, networkManager);
    // This explicit set rc handler accessToken as the RC token provider for glip handler
    const tokenManager = networkManager.getTokenManager();
    const rcTokenHandler =
      tokenManager && tokenManager.getOAuthTokenHandler(HandleByRingCentral);
    HandleByGlip.rcTokenProvider =
      rcTokenHandler && rcTokenHandler.accessToken.bind(rcTokenHandler);
  }

  static get httpConfig() {
    // TODO httpConfig should be private. but for now, it is
    // directly accessed by the ui layer. That should be refactor.
    // Move logics that access httpConfig into Api in the future.
    // tslint:disable-next-line:max-line-length
    Aware(
      ErrorTypes.API,
      'httpConfig should be private. but it is directly accessed by the ui layer.',
    );
    return this._httpConfig;
  }

  static get networkManager() {
    return this._networkManager;
  }

  static getNetworkClient(
    name: HttpConfigType,
    type: IHandleType,
  ): NetworkClient {
    console.log('=============1=========');
    console.log('=============1=========');
    console.log('=============1=========');
    if (!this._httpConfig) Throw(ErrorTypes.API, 'Api not initialized');
    console.log('=============2=========');
    console.log('=============2=========');
    console.log('=============2=========');
    let networkClient = this.httpSet.get(name);
    if (!networkClient) {
      console.log('=============3=========');
      console.log('=============3=========');
      console.log('=============3=========');
      const currentConfig = this._httpConfig[name];
      const networkRequests: INetworkRequests = {
        host: currentConfig.server,
        handlerType: type,
      };
      networkClient = new NetworkClient(
        networkRequests,
        currentConfig.apiPlatform,
        type.defaultVia,
        currentConfig.apiPlatformVersion,
        this.networkManager,
      );
      this.httpSet.set(name, networkClient);
    }
    return networkClient;
  }

  static getCustomNetworkClient(host: string, type: IHandleType) {
    let networkClient = this.httpSet.get(host);
    if (!networkClient) {
      const networkRequests: INetworkRequests = {
        host,
        handlerType: type,
      };
      networkClient = new NetworkClient(
        networkRequests,
        '',
        type.defaultVia,
        '',
        this.networkManager,
      );
      this.httpSet.set(name, networkClient);
    }
    return networkClient;
  }

  static get glipNetworkClient() {
    return this.getNetworkClient('glip', HandleByGlip);
  }

  static get glip2NetworkClient() {
    return this.getNetworkClient('glip2', HandleByGlip2);
  }

  static get glipDesktopNetworkClient() {
    return this.getNetworkClient('glip_desktop', HandleByGlip);
  }

  static get rcNetworkClient() {
    return this.getNetworkClient('rc', HandleByRingCentral);
  }

  static get uploadNetworkClient() {
    return this.getNetworkClient('upload', HandleByUpload);
  }

  static customNetworkClient(host: string) {
    return this.getCustomNetworkClient(host, HandleByCustom);
  }

  static getDataById<T>(id: number) {
    return this.glipNetworkClient.get<Raw<T>>(`${this.basePath}/${id}`);
  }

  static postData<T>(data: Partial<T>) {
    return this.glipNetworkClient.post<Raw<T>>(`${this.basePath}`, data);
  }

  static putDataById<T>(id: number, data: Partial<T>) {
    return this.glipNetworkClient.put<Raw<T>>(`${this.basePath}/${id}`, data);
  }
}

export default Api;
