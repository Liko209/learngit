/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-02 16:47:08
 * Copyright © RingCentral. All rights reserved.
 */
import NetworkClient, { INetworkRequests, IBaseQuery } from './NetworkClient';
import { ApiConfig, HttpConfigType, BaseConfig } from '../types';
import { Raw } from '../framework/model';

import { IHandleType, NetworkSetup, NetworkManager } from 'foundation/network';
import {
  HandleByGlip,
  HandleByRingCentral,
  HandleByUpload,
  HandleByCustom,
} from './handlers';
import { ApiConfiguration } from './config';

const types = [
  HandleByGlip,
  HandleByRingCentral,
  HandleByUpload,
  HandleByCustom,
];
class Api {
  static basePath = '';
  static httpSet: Map<string, NetworkClient> = new Map();

  static _networkManager: NetworkManager;

  static init(config: ApiConfig, networkManager: NetworkManager): void {
    ApiConfiguration.setApiConfig(config);
    Api.setupHandlers(networkManager);
  }

  static setupHandlers(networkManager: NetworkManager) {
    Api._networkManager = networkManager;

    types.forEach(type => NetworkSetup.setup(type, networkManager));
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
    return ApiConfiguration.apiConfig;
  }

  static get networkManager() {
    return this._networkManager;
  }

  static getNetworkClient(
    name: HttpConfigType,
    type: IHandleType,
  ): NetworkClient {
    let networkClient = this.httpSet.get(name);
    if (!networkClient) {
      const config: BaseConfig = ApiConfiguration.apiConfig[name];
      const networkRequests: INetworkRequests = {
        host: config.server,
        pathPrefix: config.pathPrefix,
        handlerType: type,
      };
      networkClient = new NetworkClient(
        networkRequests,
        type.defaultVia,
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
        type.defaultVia,
        this.networkManager,
      );
      this.httpSet.set(host, networkClient);
    }
    return networkClient;
  }

  static get glipNetworkClient() {
    return this.getNetworkClient('glip', HandleByGlip);
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

  static getDataById<T>(id: number, baseQuery?: Partial<IBaseQuery>) {
    return this.glipNetworkClient.get<Raw<T>>({
      path: `${this.basePath}/${id}`,
      ...baseQuery,
    });
  }

  static postData<T>(data: Partial<T>, baseQuery?: Partial<IBaseQuery>) {
    return this.glipNetworkClient.post<Raw<T>>({
      data,
      path: `${this.basePath}`,
      ...baseQuery,
    });
  }

  static putDataById<T>(
    id: number,
    data: Partial<T>,
    baseQuery?: Partial<IBaseQuery>,
  ) {
    return this.glipNetworkClient.put<Raw<T>>({
      data,
      path: `${this.basePath}/${id}`,
      ...baseQuery,
    });
  }
}

export default Api;
